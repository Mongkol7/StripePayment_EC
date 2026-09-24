package com.ecommerce.payment.service;

import com.ecommerce.payment.dto.*;
import com.ecommerce.payment.model.entity.*;
import com.ecommerce.payment.repository.PaymentOrderRepository;
import com.ecommerce.payment.repository.PaymentTransactionRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentOrderService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final StripeService stripeService;

    // Custom Exceptions within Person 2 Scope
    public static class InvalidOrderStateException extends RuntimeException {
        public InvalidOrderStateException(String message) {
            super(message);
        }
    }

    public static class OrderNotFoundException extends RuntimeException {
        public OrderNotFoundException(String message) {
            super(message);
        }
    }

    /**
     * Enforces the order state machine rules:
     * - Valid transitions: PENDING -> COMPLETED | FAILED | CANCELLED
     * - Terminal states (COMPLETED, FAILED, CANCELLED) cannot transition to any other state.
     * - Same-state transitions are treated as idempotent no-ops.
     */
    public void transitionOrderStatus(PaymentOrder order, PaymentStatus targetStatus) {
        PaymentStatus currentStatus = order.getStatus();

        if (currentStatus == targetStatus) {
            log.info("Order [{}] status is already [{}]. Skipping transition.", order.getOrderReference(), targetStatus);
            return;
        }

        if (currentStatus == PaymentStatus.COMPLETED ||
            currentStatus == PaymentStatus.FAILED ||
            currentStatus == PaymentStatus.CANCELLED) {
            throw new InvalidOrderStateException(String.format(
                "Cannot transition order '%s' from terminal state '%s' to '%s'",
                order.getOrderReference(), currentStatus, targetStatus
            ));
        }

        if (currentStatus == PaymentStatus.PENDING) {
            if (targetStatus == PaymentStatus.COMPLETED ||
                targetStatus == PaymentStatus.FAILED ||
                targetStatus == PaymentStatus.CANCELLED) {
                log.info("Transitioning order [{}] status: {} -> {}", order.getOrderReference(), currentStatus, targetStatus);
                order.setStatus(targetStatus);
                return;
            }
        }

        throw new InvalidOrderStateException(String.format(
            "Invalid state transition for order '%s': cannot transition from '%s' to '%s'",
            order.getOrderReference(), currentStatus, targetStatus
        ));
    }

    /**
     * Generates a unique order reference, persists a PENDING order,
     * and initializes a Stripe Checkout Session via StripeService.
     */
    @Transactional
    public PaymentResponseDto createOrder(PaymentRequestDto request) {
        String orderReference = generateOrderReference();
        String currencyCode = request.getCurrency() != null ? request.getCurrency().trim().toUpperCase() : "USD";
        boolean isRecurring = Boolean.TRUE.equals(request.getIsRecurring());

        PaymentOrder order = PaymentOrder.builder()
                .orderReference(orderReference)
                .amount(request.getAmount())
                .currency(currencyCode)
                .status(PaymentStatus.PENDING)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .description(request.getDescription())
                .paymentType(isRecurring ? "SUBSCRIPTION" : "ONE_TIME")
                .billingInterval(isRecurring ? (request.getBillingInterval() != null ? request.getBillingInterval().toUpperCase() : "DAY") : null)
                .subscriptionStatus(isRecurring ? "PENDING" : null)
                .build();

        order = paymentOrderRepository.save(order);
        log.info("Persisted initial PENDING order: Ref={}, Amount={} {}, Type={}", orderReference, order.getAmount(), currencyCode, order.getPaymentType());

        try {
            Session session = stripeService.createCheckoutSession(order, request);
            order.setStripeSessionId(session.getId());
            order.setStripePaymentIntentId(session.getPaymentIntent());
            if (session.getSubscription() != null) {
                order.setStripeSubscriptionId(session.getSubscription());
            }
            if (session.getCustomer() != null) {
                order.setStripeCustomerId(session.getCustomer());
            }
            paymentOrderRepository.save(order);

            // Record audit transaction
            recordAuditTransaction(order, PaymentTransactionType.CHECKOUT_SESSION_CREATED, 
                    order.getAmount(), session.getId(), null, null, null, null, null, null);

            return PaymentResponseDto.builder()
                    .orderReference(orderReference)
                    .checkoutUrl(session.getUrl())
                    .sessionId(session.getId())
                    .status(order.getStatus().name())
                    .message("Stripe Checkout Session initialized successfully")
                    .build();
        } catch (StripeException e) {
            log.error("Failed to create Stripe Checkout Session for order: {}", orderReference, e);
            transitionOrderStatus(order, PaymentStatus.FAILED);
            paymentOrderRepository.save(order);

            // Record failed transaction
            recordAuditTransaction(order, PaymentTransactionType.PAYMENT_FAILED,
                    order.getAmount(), null, null, null, null, null, 
                    e.getCode(), e.getMessage());

            throw new RuntimeException("Error initializing Stripe Checkout: " + e.getMessage(), e);
        }
    }

    /**
     * Backward-compatibility alias for createOrder.
     */
    @Transactional
    public PaymentResponseDto initiatePayment(PaymentRequestDto request) {
        return createOrder(request);
    }

    /**
     * Confirms and completes a payment session once Stripe Checkout finishes.
     */
    @Transactional
    public OrderReceiptDto confirmOrder(String sessionId) {
        PaymentOrder order = paymentOrderRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new OrderNotFoundException("Payment order not found for Stripe session: " + sessionId));

        try {
            Session session = stripeService.retrieveSession(sessionId);
            if ("paid".equalsIgnoreCase(session.getPaymentStatus()) || "complete".equalsIgnoreCase(session.getStatus())) {
                transitionOrderStatus(order, PaymentStatus.COMPLETED);
                if (session.getPaymentIntent() != null) {
                    order.setStripePaymentIntentId(session.getPaymentIntent());
                }
                if (session.getSubscription() != null) {
                    order.setStripeSubscriptionId(session.getSubscription());
                    order.setSubscriptionStatus("ACTIVE");
                    order.setPaymentType("SUBSCRIPTION");
                    if (order.getBillingInterval() == null) {
                        order.setBillingInterval("DAY");
                    }
                }
                if (session.getCustomer() != null) {
                    order.setStripeCustomerId(session.getCustomer());
                }
                paymentOrderRepository.save(order);

                // Extract Card Brand & Last 4 if available
                String cardBrand = null;
                String cardLast4 = null;
                String chargeId = null;

                if (session.getPaymentIntent() != null) {
                    try {
                        PaymentIntent intent = stripeService.retrievePaymentIntent(session.getPaymentIntent());
                        if (intent.getLatestCharge() != null) {
                            chargeId = intent.getLatestCharge();
                            Charge charge = stripeService.retrieveCharge(chargeId);
                            if (charge.getPaymentMethodDetails() != null && charge.getPaymentMethodDetails().getCard() != null) {
                                cardBrand = charge.getPaymentMethodDetails().getCard().getBrand();
                                cardLast4 = charge.getPaymentMethodDetails().getCard().getLast4();
                            }
                        }
                    } catch (StripeException ex) {
                        log.warn("Could not retrieve detailed card brand/last4 from Stripe: {}", ex.getMessage());
                    }
                }

                PaymentTransactionType txType = (order.getStripeSubscriptionId() != null)
                        ? PaymentTransactionType.SUBSCRIPTION_CREATED
                        : PaymentTransactionType.PAYMENT_SUCCESS;

                // Record audit transaction
                recordAuditTransaction(order, txType,
                        order.getAmount(), sessionId, order.getStripePaymentIntentId(), 
                        chargeId, cardBrand, cardLast4, null, null);

                log.info("Order [{}] confirmed and marked COMPLETED (Type={})", order.getOrderReference(), order.getPaymentType());
            } else {
                log.warn("Stripe session [{}] status is '{}' (not 'paid')", sessionId, session.getPaymentStatus());
            }
        } catch (StripeException e) {
            log.warn("Could not retrieve Stripe session details for verification: {}", sessionId, e);
            throw new RuntimeException("Stripe session verification failed: " + e.getMessage(), e);
        }

        return mapToReceiptDto(order);
    }

    /**
     * Backward-compatibility alias for confirmOrder.
     */
    @Transactional
    public OrderReceiptDto confirmPaymentBySessionId(String sessionId) {
        return confirmOrder(sessionId);
    }

    /**
     * Processes full or partial refund for a completed payment order.
     */
    @Transactional
    public RefundResponseDto processRefund(String orderReference, RefundRequestDto request) {
        PaymentOrder order = paymentOrderRepository.findByOrderReference(orderReference)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + orderReference));

        if (order.getStatus() != PaymentStatus.COMPLETED && order.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new InvalidOrderStateException("Only COMPLETED or PARTIALLY_REFUNDED orders can be refunded. Current status: " + order.getStatus());
        }

        if (order.getStripePaymentIntentId() == null || order.getStripePaymentIntentId().isBlank()) {
            throw new IllegalStateException("Missing Stripe PaymentIntent ID for order: " + orderReference);
        }

        BigDecimal refundAmount = (request != null && request.getAmount() != null)
                ? request.getAmount()
                : order.getAmount();

        String reason = (request != null && request.getReason() != null)
                ? request.getReason()
                : "requested_by_customer";

        try {
            Refund refund = stripeService.createRefund(order.getStripePaymentIntentId(), refundAmount, reason);

            boolean isFullRefund = refundAmount.compareTo(order.getAmount()) >= 0;
            order.setStatus(isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED);
            paymentOrderRepository.save(order);

            // Record refund audit transaction
            PaymentTransaction transaction = PaymentTransaction.builder()
                    .orderReference(order.getOrderReference())
                    .paymentOrder(order)
                    .transactionType(PaymentTransactionType.REFUND_ISSUED)
                    .amount(refundAmount)
                    .currency(order.getCurrency())
                    .stripePaymentIntentId(order.getStripePaymentIntentId())
                    .stripeRefundId(refund.getId())
                    .rawPayload("Status: " + refund.getStatus() + " | Reason: " + reason)
                    .build();
            paymentTransactionRepository.save(transaction);

            return RefundResponseDto.builder()
                    .orderReference(orderReference)
                    .refundId(refund.getId())
                    .amountRefunded(refundAmount)
                    .currency(order.getCurrency())
                    .status(order.getStatus().name())
                    .message("Refund processed successfully via Stripe")
                    .build();
        } catch (StripeException e) {
            log.error("Stripe refund failed for order: {}", orderReference, e);
            throw new RuntimeException("Stripe refund failed: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieves audit transaction history for a given order reference.
     */
    @Transactional(readOnly = true)
    public List<PaymentTransactionDto> getTransactionHistory(String orderReference) {
        return paymentTransactionRepository.findByOrderReferenceOrderByCreatedAtDesc(orderReference)
                .stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    /**
     * Cancels an order when the customer cancels checkout.
     */
    @Transactional
    public void cancelPaymentOrder(String orderReference) {
        PaymentOrder order = paymentOrderRepository.findByOrderReference(orderReference)
                .orElseThrow(() -> new OrderNotFoundException("Payment order not found for reference: " + orderReference));

        transitionOrderStatus(order, PaymentStatus.CANCELLED);
        paymentOrderRepository.save(order);
        log.info("Order [{}] marked as CANCELLED", orderReference);
    }

    /**
     * Backward-compatibility alias for cancelPaymentOrder.
     */
    @Transactional
    public void cancelOrder(String orderReference) {
        cancelPaymentOrder(orderReference);
    }

    /**
     * Retrieves an order receipt by order reference.
     */
    @Transactional(readOnly = true)
    public OrderReceiptDto getReceipt(String orderReference) {
        PaymentOrder order = paymentOrderRepository.findByOrderReference(orderReference)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with reference: " + orderReference));
        return mapToReceiptDto(order);
    }

    /**
     * Searches customer orders by email, order reference, customer name, or retrieves latest orders if query is blank.
     */
    @Transactional(readOnly = true)
    public List<OrderReceiptDto> searchOrders(String query) {
        List<PaymentOrder> orders;
        if (query == null || query.isBlank()) {
            orders = paymentOrderRepository.findTop20ByOrderByCreatedAtDesc();
        } else {
            orders = paymentOrderRepository.searchByKeyword(query.trim());
        }
        return orders.stream().map(this::mapToReceiptDto).collect(Collectors.toList());
    }


    /**
     * Cancels an active daily recurring subscription.
     */
    @Transactional
    public SubscriptionCancelResponseDto cancelSubscription(String orderReference) {
        PaymentOrder order = paymentOrderRepository.findByOrderReference(orderReference)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with reference: " + orderReference));

        if (!"SUBSCRIPTION".equalsIgnoreCase(order.getPaymentType()) || order.getStripeSubscriptionId() == null) {
            throw new InvalidOrderStateException("Order " + orderReference + " is not an active recurring subscription");
        }

        try {
            stripeService.cancelSubscription(order.getStripeSubscriptionId());
            order.setSubscriptionStatus("CANCELLED");
            paymentOrderRepository.save(order);

            // Record transaction
            PaymentTransaction transaction = PaymentTransaction.builder()
                    .orderReference(order.getOrderReference())
                    .paymentOrder(order)
                    .transactionType(PaymentTransactionType.SUBSCRIPTION_CANCELLED)
                    .amount(order.getAmount())
                    .currency(order.getCurrency())
                    .stripeSubscriptionId(order.getStripeSubscriptionId())
                    .rawPayload("Subscription cancelled by customer/admin")
                    .build();
            paymentTransactionRepository.save(transaction);

            log.info("Subscription [{}] for order [{}] successfully cancelled", order.getStripeSubscriptionId(), orderReference);
            return SubscriptionCancelResponseDto.builder()
                    .orderReference(orderReference)
                    .stripeSubscriptionId(order.getStripeSubscriptionId())
                    .subscriptionStatus("CANCELLED")
                    .message("Daily subscription cancelled successfully. No further daily charges will be made.")
                    .build();
        } catch (StripeException e) {
            log.error("Failed to cancel Stripe subscription: {}", order.getStripeSubscriptionId(), e);
            throw new RuntimeException("Failed to cancel subscription: " + e.getMessage(), e);
        }
    }

    /**
     * Handles automated daily deduction webhook (invoice.paid).
     */
    @Transactional
    public void handleInvoicePaid(String subscriptionId, BigDecimal amount, String currency, String invoiceId, String chargeId) {
        if (subscriptionId == null || subscriptionId.isBlank()) {
            return;
        }

        paymentOrderRepository.findByStripeSubscriptionId(subscriptionId).ifPresent(order -> {
            order.setSubscriptionStatus("ACTIVE");
            paymentOrderRepository.save(order);

            PaymentTransaction renewalTx = PaymentTransaction.builder()
                    .orderReference(order.getOrderReference())
                    .paymentOrder(order)
                    .transactionType(PaymentTransactionType.SUBSCRIPTION_RENEWED)
                    .amount(amount != null ? amount : order.getAmount())
                    .currency(currency != null ? currency.toUpperCase() : order.getCurrency())
                    .stripeSubscriptionId(subscriptionId)
                    .stripeInvoiceId(invoiceId)
                    .stripeChargeId(chargeId)
                    .rawPayload("Daily recurring subscription renewal charged successfully: Invoice " + invoiceId)
                    .build();
            paymentTransactionRepository.save(renewalTx);
            log.info("Daily subscription renewal recorded for order [{}] and subscription [{}]: Invoice={}", 
                    order.getOrderReference(), subscriptionId, invoiceId);
        });
    }

    /**
     * Handles daily deduction failure webhook (invoice.payment_failed).
     */
    @Transactional
    public void handleInvoicePaymentFailed(String subscriptionId, String invoiceId, String failureMessage) {
        if (subscriptionId == null || subscriptionId.isBlank()) {
            return;
        }

        paymentOrderRepository.findByStripeSubscriptionId(subscriptionId).ifPresent(order -> {
            order.setSubscriptionStatus("PAST_DUE");
            paymentOrderRepository.save(order);

            PaymentTransaction failedTx = PaymentTransaction.builder()
                    .orderReference(order.getOrderReference())
                    .paymentOrder(order)
                    .transactionType(PaymentTransactionType.PAYMENT_FAILED)
                    .amount(order.getAmount())
                    .currency(order.getCurrency())
                    .stripeSubscriptionId(subscriptionId)
                    .stripeInvoiceId(invoiceId)
                    .failureMessage(failureMessage)
                    .rawPayload("Daily recurring subscription renewal failed: " + failureMessage)
                    .build();
            paymentTransactionRepository.save(failedTx);
            log.warn("Daily subscription renewal failed for order [{}] and subscription [{}]: Invoice={}", 
                    order.getOrderReference(), subscriptionId, invoiceId);
        });
    }

    /**
     * Handles subscription deletion/cancellation from Stripe.
     */
    @Transactional
    public void handleSubscriptionDeleted(String subscriptionId) {
        if (subscriptionId == null || subscriptionId.isBlank()) return;
        paymentOrderRepository.findByStripeSubscriptionId(subscriptionId).ifPresent(order -> {
            order.setSubscriptionStatus("CANCELLED");
            paymentOrderRepository.save(order);
            log.info("Subscription [{}] marked as CANCELLED via webhook for order [{}]", subscriptionId, order.getOrderReference());
        });
    }

    private void recordAuditTransaction(PaymentOrder order, PaymentTransactionType type,
                                         BigDecimal amount, String sessionId, String paymentIntentId,
                                         String chargeId, String cardBrand, String cardLast4,
                                         String failureCode, String failureMessage) {
        PaymentTransaction tx = PaymentTransaction.builder()
                .orderReference(order.getOrderReference())
                .paymentOrder(order)
                .transactionType(type)
                .amount(amount)
                .currency(order.getCurrency())
                .stripePaymentIntentId(paymentIntentId)
                .stripeSubscriptionId(order.getStripeSubscriptionId())
                .stripeChargeId(chargeId)
                .paymentMethodType("card")
                .cardBrand(cardBrand)
                .cardLast4(cardLast4)
                .failureCode(failureCode)
                .failureMessage(failureMessage)
                .rawPayload("Session: " + sessionId)
                .build();
        paymentTransactionRepository.save(tx);
    }

    private OrderReceiptDto mapToReceiptDto(PaymentOrder order) {
        return OrderReceiptDto.builder()
                .orderReference(order.getOrderReference())
                .amount(order.getAmount())
                .currency(order.getCurrency())
                .status(order.getStatus())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .description(order.getDescription())
                .stripeSessionId(order.getStripeSessionId())
                .stripePaymentIntentId(order.getStripePaymentIntentId())
                .paymentType(order.getPaymentType())
                .billingInterval(order.getBillingInterval())
                .stripeCustomerId(order.getStripeCustomerId())
                .stripeSubscriptionId(order.getStripeSubscriptionId())
                .subscriptionStatus(order.getSubscriptionStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private PaymentTransactionDto mapToTransactionDto(PaymentTransaction tx) {
        return PaymentTransactionDto.builder()
                .id(tx.getId())
                .orderReference(tx.getOrderReference())
                .transactionType(tx.getTransactionType())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .stripeChargeId(tx.getStripeChargeId())
                .stripePaymentIntentId(tx.getStripePaymentIntentId())
                .stripeRefundId(tx.getStripeRefundId())
                .stripeSubscriptionId(tx.getStripeSubscriptionId())
                .stripeInvoiceId(tx.getStripeInvoiceId())
                .paymentMethodType(tx.getPaymentMethodType())
                .cardBrand(tx.getCardBrand())
                .cardLast4(tx.getCardLast4())
                .failureCode(tx.getFailureCode())
                .failureMessage(tx.getFailureMessage())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private String generateOrderReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + datePart + "-" + randomPart;
    }
}
