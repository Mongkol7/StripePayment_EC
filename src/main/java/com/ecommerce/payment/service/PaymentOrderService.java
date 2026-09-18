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

    /**
     * Initializes a payment order, saves it to PostgreSQL, and requests a Stripe Checkout Session.
     */
    @Transactional
    public PaymentResponseDto initiatePayment(PaymentRequestDto request) {
        String orderReference = generateOrderReference();

        PaymentOrder order = PaymentOrder.builder()
                .orderReference(orderReference)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency().toUpperCase() : "USD")
                .status(PaymentStatus.PENDING)
                .customerName(request.getCustomerName())
                .customerEmail(request.getCustomerEmail())
                .description(request.getDescription())
                .build();

        order = paymentOrderRepository.save(order);
        log.info("Saved initial payment order: REF={}, Amount=${}", orderReference, order.getAmount());

        try {
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
            order.setStatus(PaymentStatus.FAILED);
            paymentOrderRepository.save(order);

            throw new RuntimeException("Error initializing Stripe Checkout: " + e.getMessage(), e);
        }
    }

    /**
     * Confirms and completes a payment session once customer finishes Stripe Checkout.
     */
    @Transactional
    public OrderReceiptDto confirmPaymentBySessionId(String sessionId) {
        PaymentOrder order = paymentOrderRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Payment order not found for session: " + sessionId));

        try {
            Session session = stripeService.retrieveSession(sessionId);
            if ("paid".equalsIgnoreCase(session.getPaymentStatus())) {
                order.setStatus(PaymentStatus.COMPLETED);
                if (session.getPaymentIntent() != null) {
                    order.setStripePaymentIntentId(session.getPaymentIntent());
                }
                paymentOrderRepository.save(order);
                log.info("Payment confirmed and marked COMPLETED: REF={}", order.getOrderReference());
            }
        } catch (StripeException e) {
            log.warn("Could not retrieve Stripe session details for verification: {}", sessionId, e);
        }

        return mapToReceiptDto(order);
    }

    /**
     * Marks an order as CANCELLED if the user abandons checkout.
     */
    @Transactional
    public void cancelPaymentOrder(String orderReference) {
        paymentOrderRepository.findByOrderReference(orderReference).ifPresent(order -> {
            if (order.getStatus() == PaymentStatus.PENDING) {
                order.setStatus(PaymentStatus.CANCELLED);
                paymentOrderRepository.save(order);
                log.info("Order marked as CANCELLED: REF={}", orderReference);
            }
        });
    }

    /**
     * Retrieves order receipt details by order reference.
     */
    @Transactional(readOnly = true)
    public OrderReceiptDto getReceipt(String orderReference) {
        PaymentOrder order = paymentOrderRepository.findByOrderReference(orderReference)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderReference));
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
