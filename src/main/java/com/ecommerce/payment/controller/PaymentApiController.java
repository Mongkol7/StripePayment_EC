package com.ecommerce.payment.controller;

import com.ecommerce.payment.dto.OrderReceiptDto;
import com.ecommerce.payment.dto.PaymentRequestDto;
import com.ecommerce.payment.dto.PaymentResponseDto;
import com.ecommerce.payment.service.PaymentOrderService;
import com.ecommerce.payment.service.StripeService;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    paymentOrderService.confirmPaymentBySessionId(session.getId());
                }
            }

            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            log.error("Webhook processing error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }
    }
}
