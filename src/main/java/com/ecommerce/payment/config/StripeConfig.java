package com.ecommerce.payment.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class StripeConfig {

    @Value("${stripe.api.key}")
    private String apiKey;

    @PostConstruct
    public void initStripe() {
        if (apiKey != null && !apiKey.isBlank()) {
            Stripe.apiKey = apiKey;
            log.info("Stripe Java SDK initialized successfully (Key starts with: {}...)", 
                     apiKey.length() > 7 ? apiKey.substring(0, 7) : "N/A");
        } else {
            log.warn("Stripe API key is not configured. Please set 'stripe.api.key' or STRIPE_SECRET_KEY.");
        }
    }
}
