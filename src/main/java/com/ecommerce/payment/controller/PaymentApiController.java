package com.ecommerce.payment.controller;

import com.ecommerce.payment.dto.*;
import com.ecommerce.payment.service.PaymentOrderService;
import com.ecommerce.payment.service.StripeService;
import com.stripe.model.Charge;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentApiController {

    private final PaymentOrderService paymentOrderService;
    private final StripeService stripeService;

    /**
     * Creates a new payment order and initializes a Stripe Checkout Session.
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@Valid @RequestBody PaymentRequestDto request) {
        try {
            PaymentResponseDto response = paymentOrderService.initiatePayment(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating checkout session", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Failed to initiate payment",
                            "message", e.getMessage()
                    ));
        }
    }

    /**
     * Confirms payment and retrieves receipt after successful Stripe Checkout.
     */
    @GetMapping("/confirm/{sessionId}")
    public ResponseEntity<OrderReceiptDto> confirmPayment(@PathVariable String sessionId) {
        OrderReceiptDto receipt = paymentOrderService.confirmPaymentBySessionId(sessionId);
        return ResponseEntity.ok(receipt);
    }

    /**
     * Retrieves an order receipt by its unique order reference.
     */
    @GetMapping("/receipt/{orderReference}")
    public ResponseEntity<OrderReceiptDto> getReceipt(@PathVariable String orderReference) {
        OrderReceiptDto receipt = paymentOrderService.getReceipt(orderReference);
        return ResponseEntity.ok(receipt);
    }

    /**
     * Searches order history by customer email or order reference.
     */
    @GetMapping("/orders/lookup")
    public ResponseEntity<List<OrderReceiptDto>> lookupOrders(@RequestParam(required = false) String query) {
        List<OrderReceiptDto> orders = paymentOrderService.searchOrders(query);
        return ResponseEntity.ok(orders);
    }

    /**
     * Executes a full or partial refund for a completed order.
     */
    @PostMapping("/refund/{orderReference}")
    public ResponseEntity<?> processRefund(
            @PathVariable String orderReference,
            @RequestBody(required = false) RefundRequestDto request) {
        try {
            RefundResponseDto response = paymentOrderService.processRefund(orderReference, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error executing refund for order: {}", orderReference, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error", "Refund failed",
                            "message", e.getMessage()
                    ));
        }
    }

    /**
     * Retrieves audit transaction history for a given order reference.
     */
    @GetMapping("/transactions/{orderReference}")
    public ResponseEntity<List<PaymentTransactionDto>> getTransactions(@PathVariable String orderReference) {
        List<PaymentTransactionDto> transactions = paymentOrderService.getTransactionHistory(orderReference);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Notifies order cancellation when checkout is cancelled by user.
     */
    @PostMapping("/cancel/{orderReference}")
    public ResponseEntity<Map<String, String>> cancelOrder(@PathVariable String orderReference) {
        paymentOrderService.cancelPaymentOrder(orderReference);
        return ResponseEntity.ok(Map.of("message", "Order cancelled successfully", "orderReference", orderReference));
    }

    /**
     * Webhook endpoint for Stripe asynchronous notifications.
     */
    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            Event event = stripeService.constructWebhookEvent(payload, sigHeader);
            log.info("Stripe Webhook received: Type={}, ID={}", event.getType(), event.getId());

            switch (event.getType()) {
                case "checkout.session.completed" -> {
                    Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (session != null) {
                        paymentOrderService.confirmPaymentBySessionId(session.getId());
                    }
                }
                case "payment_intent.payment_failed" -> {
                    PaymentIntent failedIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (failedIntent != null) {
                        log.warn("PaymentIntent failed: ID={}, Error={}", 
                                failedIntent.getId(), 
                                failedIntent.getLastPaymentError() != null ? failedIntent.getLastPaymentError().getMessage() : "Unknown");
                    }
                }
                case "charge.refunded" -> {
                    Charge refundedCharge = (Charge) event.getDataObjectDeserializer().getObject().orElse(null);
                    if (refundedCharge != null) {
                        log.info("Charge refunded webhook received: ChargeID={}, AmountRefunded={}", 
                                refundedCharge.getId(), refundedCharge.getAmountRefunded());
                    }
                }
                default -> log.debug("Unhandled webhook event type: {}", event.getType());
            }

            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            log.error("Webhook processing error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }
    }
}
