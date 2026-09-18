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
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
     * 3. Webhook endpoint for Stripe asynchronous events.
     * Delegates verification to StripeService.
     * NOTE FOR PERSON 1: Assumes StripeService provides webhook event verification/handling.
     */
    @PostMapping("/stripe/webhook")
    public ResponseEntity<Map<String, String>> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        log.info("Received Stripe webhook notification");
        try {
            // NOTE / ASSUMPTION FOR PERSON 1:
            // Currently calling stripeService.constructWebhookEvent(payload, sigHeader).
            // Once Person 1 completes Task 1.2 and consolidates this into
            // stripeService.handleWebhookEvent(payload, sigHeader), this call can be substituted.
            Event event = stripeService.constructWebhookEvent(payload, sigHeader);
            log.info("Stripe Webhook event verified: Type={}, ID={}", event.getType(), event.getId());

            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    paymentOrderService.confirmOrder(session.getId());
                    log.info("Order confirmed via webhook for session: {}", session.getId());
                }
            }

            return ResponseEntity.ok(Map.of("message", "Webhook processed successfully", "status", "SUCCESS"));
        } catch (Exception e) {
            log.error("Webhook verification/processing error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Webhook processing failed", "message", e.getMessage()));
        }
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
     * Notifies order cancellation when checkout is abandoned by customer.
     */
    @PostMapping("/cancel/{orderReference}")
    public ResponseEntity<Map<String, String>> cancelOrder(@PathVariable String orderReference) {
        paymentOrderService.cancelPaymentOrder(orderReference);
        return ResponseEntity.ok(Map.of("message", "Order cancelled successfully", "orderReference", orderReference));
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
