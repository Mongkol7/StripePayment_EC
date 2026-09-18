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
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
     * 1. Creates a new payment order and initializes a Stripe Checkout Session.
     * Returns 201 Created on success.
     */
    @PostMapping("/create-checkout-session")
    public ResponseEntity<PaymentResponseDto> createCheckoutSession(@Valid @RequestBody PaymentRequestDto request) {
        log.info("Received checkout session request for amount: ${} ({})", request.getAmount(), request.getCurrency());
        PaymentResponseDto response = paymentOrderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 2. Confirms payment and retrieves receipt after successful Stripe Checkout.
     * Returns 200 OK on success, 404 Not Found if session is unknown.
     */
    @GetMapping("/confirm/{sessionId}")
    public ResponseEntity<OrderReceiptDto> confirmPayment(@PathVariable String sessionId) {
        log.info("Confirming payment for session: {}", sessionId);
        OrderReceiptDto receipt = paymentOrderService.confirmOrder(sessionId);
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
     * Notifies order cancellation when checkout is abandoned by customer.
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

    // ===================================================================
    // Exception Handlers (Covering 400, 404, 409, 500)
    // ===================================================================

    /**
     * Handles DTO validation errors (@Valid). Returns 400 Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> errorBody = new HashMap<>();
        errorBody.put("error", "Validation Failed");
        errorBody.put("status", HttpStatus.BAD_REQUEST.value());
        errorBody.put("details", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody);
    }

    /**
     * Handles invalid arguments. Returns 400 Bad Request.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Bad Request",
                "status", HttpStatus.BAD_REQUEST.value(),
                "message", ex.getMessage()
        ));
    }

    /**
     * Handles order not found errors. Returns 404 Not Found.
     */
    @ExceptionHandler(PaymentOrderService.OrderNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleOrderNotFoundException(PaymentOrderService.OrderNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "error", "Not Found",
                "status", HttpStatus.NOT_FOUND.value(),
                "message", ex.getMessage()
        ));
    }

    /**
     * Handles invalid state machine transitions. Returns 409 Conflict.
     */
    @ExceptionHandler(PaymentOrderService.InvalidOrderStateException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidOrderStateException(PaymentOrderService.InvalidOrderStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "Conflict",
                "status", HttpStatus.CONFLICT.value(),
                "message", ex.getMessage()
        ));
    }

    /**
     * General fallback exception handler.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleGeneralRuntimeException(RuntimeException ex) {
        log.error("Unhandled runtime exception in PaymentApiController: ", ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "error", "Operation Failed",
                "status", HttpStatus.BAD_REQUEST.value(),
                "message", ex.getMessage()
        ));
    }
}
