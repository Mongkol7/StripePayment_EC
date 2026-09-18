package com.ecommerce.payment.service;

import com.ecommerce.payment.dto.OrderReceiptDto;
import com.ecommerce.payment.dto.PaymentRequestDto;
import com.ecommerce.payment.dto.PaymentResponseDto;
import com.ecommerce.payment.model.entity.PaymentOrder;
import com.ecommerce.payment.model.entity.PaymentStatus;
import com.ecommerce.payment.repository.PaymentOrderRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentOrderService {

    private final PaymentOrderRepository paymentOrderRepository;
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

        PaymentOrder order = PaymentOrder.builder()
                .orderReference(orderReference)
                .amount(request.getAmount())
                .currency(currencyCode)
                .status(PaymentStatus.PENDING)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .description(request.getDescription())
                .build();

        order = paymentOrderRepository.save(order);
        log.info("Persisted initial PENDING order: Ref={}, Amount={} {}", orderReference, order.getAmount(), currencyCode);

        try {
            // ASSUMPTION FOR PERSON 1:
            // Currently calling stripeService.createCheckoutSession(order, request).
            // If Person 1 alters signature to stripeService.createCheckoutSession(order),
            // this invocation can be updated accordingly.
            Session session = stripeService.createCheckoutSession(order, request);
            order.setStripeSessionId(session.getId());
            order.setStripePaymentIntentId(session.getPaymentIntent());
            paymentOrderRepository.save(order);

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
            if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
                transitionOrderStatus(order, PaymentStatus.COMPLETED);
                if (session.getPaymentIntent() != null) {
                    order.setStripePaymentIntentId(session.getPaymentIntent());
                }
                order = paymentOrderRepository.save(order);
                log.info("Order [{}] confirmed and marked COMPLETED", order.getOrderReference());
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
                .createdAt(order.getCreatedAt())
                .build();
    }

    private String generateOrderReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + datePart + "-" + randomPart;
    }
}
