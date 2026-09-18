package com.ecommerce.payment.service;

import com.ecommerce.payment.dto.PaymentRequestDto;
import com.ecommerce.payment.model.entity.PaymentOrder;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final CurrencyConverterService currencyConverterService;

    @Value("${stripe.currency:usd}")
    private String currency;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    /**
     * Creates a Stripe Checkout Session for a given payment order.
     * Supports both USD directly and KHR automatically converted to USD cents.
     */
    public Session createCheckoutSession(PaymentOrder order, PaymentRequestDto request) throws StripeException {
        BigDecimal finalAmountInUsd = order.getAmount();

        // If currency is KHR, convert to USD for Stripe settlement
        if ("KHR".equalsIgnoreCase(order.getCurrency())) {
            finalAmountInUsd = currencyConverterService.convertKhrToUsd(order.getAmount());
            log.info("Converted KHR {} to USD {} for Stripe Session", order.getAmount(), finalAmountInUsd);
        }

        long amountInCents = currencyConverterService.toStripeCents(finalAmountInUsd);

        String productName = (order.getDescription() != null && !order.getDescription().isBlank())
                ? order.getDescription()
                : "E-Commerce Payment (" + order.getOrderReference() + ")";

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(order.getCustomerEmail())
                .setClientReferenceId(order.getOrderReference())
                .putMetadata("orderReference", order.getOrderReference())
                .putMetadata("customerName", order.getCustomerName())
                .putMetadata("originalCurrency", order.getCurrency())
                .putMetadata("originalAmount", order.getAmount().toString())
                .setSuccessUrl(baseUrl + "/success.html?session_id={CHECKOUT_SESSION_ID}&order_ref=" + order.getOrderReference())
                .setCancelUrl(baseUrl + "/cancel.html?order_ref=" + order.getOrderReference())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(productName)
                                                                .setDescription("Order Reference: " + order.getOrderReference() + " | Customer: " + order.getCustomerName())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                );

        Session session = Session.create(paramsBuilder.build());
        log.info("Stripe Checkout Session created: ID={}, URL={}", session.getId(), session.getUrl());
        return session;
    }

    /**
     * Issues a full or partial refund for a completed payment.
     */
    public Refund createRefund(String paymentIntentId, BigDecimal amountInUsd, String reason) throws StripeException {
        RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId);

        if (amountInUsd != null && amountInUsd.compareTo(BigDecimal.ZERO) > 0) {
            paramsBuilder.setAmount(currencyConverterService.toStripeCents(amountInUsd));
        }

        if (reason != null && !reason.isBlank()) {
            try {
                paramsBuilder.setReason(RefundCreateParams.Reason.valueOf(reason.toUpperCase()));
            } catch (IllegalArgumentException e) {
                paramsBuilder.setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER);
            }
        }

        Refund refund = Refund.create(paramsBuilder.build());
        log.info("Stripe Refund executed: RefundID={}, Status={}, AmountCents={}", 
                refund.getId(), refund.getStatus(), refund.getAmount());
        return refund;
    }

    /**
     * Retrieves an existing Stripe Checkout Session.
     */
    public Session retrieveSession(String sessionId) throws StripeException {
        return Session.retrieve(sessionId);
    }

    /**
     * Retrieves a Stripe PaymentIntent.
     */
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    /**
     * Retrieves a Stripe Charge.
     */
    public Charge retrieveCharge(String chargeId) throws StripeException {
        return Charge.retrieve(chargeId);
    }

    /**
     * Verifies and constructs Stripe Webhook Event.
     */
    public com.stripe.model.Event constructWebhookEvent(String payload, String sigHeader) throws Exception {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new IllegalStateException("Stripe webhook secret is not configured in application.properties.");
        }
        return Webhook.constructEvent(payload, sigHeader, webhookSecret);
    }
}
