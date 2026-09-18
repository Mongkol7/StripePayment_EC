package com.ecommerce.payment.service;

import com.ecommerce.payment.dto.PaymentRequestDto;
import com.ecommerce.payment.model.entity.PaymentOrder;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class StripeService {

    @Value("${stripe.currency:usd}")
    private String currency;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    /**
     * Creates a Stripe Checkout Session for a given payment order.
     * Amount is multiplied by 100 as Stripe handles amounts in cents (e.g. $10.50 -> 1050 cents).
     */
    public Session createCheckoutSession(PaymentOrder order, PaymentRequestDto request) throws StripeException {
        long amountInCents = order.getAmount().multiply(new BigDecimal("100")).longValue();

        String productName = (order.getDescription() != null && !order.getDescription().isBlank())
                ? order.getDescription()
                : "E-Commerce Payment (" + order.getOrderReference() + ")";

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(order.getCustomerEmail())
                .setClientReferenceId(order.getOrderReference())
                .putMetadata("orderReference", order.getOrderReference())
                .putMetadata("customerName", order.getCustomerName())
                .setSuccessUrl(baseUrl + "/success.html?session_id={CHECKOUT_SESSION_ID}&order_ref=" + order.getOrderReference())
                .setCancelUrl(baseUrl + "/cancel.html?order_ref=" + order.getOrderReference())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(order.getCurrency().toLowerCase())
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
                )
                .build();

        Session session = Session.create(params);
        log.info("Stripe Checkout Session created: ID={}, URL={}", session.getId(), session.getUrl());
        return session;
    }

    /**
     * Retrieves an existing Stripe Checkout Session.
     */
    public Session retrieveSession(String sessionId) throws StripeException {
        return Session.retrieve(sessionId);
    }

    /**
     * Verifies and constructs Stripe Webhook Event.
     */
    public com.stripe.model.Event constructWebhookEvent(String payload, String sigHeader) throws Exception {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new IllegalStateException("Stripe webhook secret is not configured.");
        }
        return Webhook.constructEvent(payload, sigHeader, webhookSecret);
    }
}
