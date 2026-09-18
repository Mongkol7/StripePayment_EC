package com.ecommerce.payment.service;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Getter
public class CurrencyConverterService {

    @Value("${stripe.khr-to-usd-rate:4100.0}")
    private BigDecimal khrToUsdRate;

    /**
     * Converts an amount in Khmer Riel (KHR) to US Dollars (USD).
     * e.g., 41,000 KHR at 4,100 rate = 10.00 USD.
     */
    public BigDecimal convertKhrToUsd(BigDecimal khrAmount) {
        if (khrAmount == null || khrAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return khrAmount.divide(khrToUsdRate, 2, RoundingMode.HALF_UP);
    }

    /**
     * Converts an amount in US Dollars (USD) to Khmer Riel (KHR).
     * e.g., 10.00 USD at 4,100 rate = 41,000 KHR.
     */
    public BigDecimal convertUsdToKhr(BigDecimal usdAmount) {
        if (usdAmount == null || usdAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return usdAmount.multiply(khrToUsdRate).setScale(0, RoundingMode.HALF_UP);
    }

    /**
     * Converts a USD amount to Stripe unit amount in cents (e.g. $10.50 -> 1050).
     */
    public long toStripeCents(BigDecimal usdAmount) {
        if (usdAmount == null) return 0L;
        return usdAmount.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValue();
    }
}
