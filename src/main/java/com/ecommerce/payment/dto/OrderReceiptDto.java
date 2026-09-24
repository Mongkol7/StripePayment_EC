package com.ecommerce.payment.dto;

import com.ecommerce.payment.model.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderReceiptDto {
    private String orderReference;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String customerName;
    private String customerEmail;
    private String description;
    private String stripeSessionId;
    private String stripePaymentIntentId;
    private String paymentType;
    private String billingInterval;
    private String stripeCustomerId;
    private String stripeSubscriptionId;
    private String subscriptionStatus;
    private LocalDateTime createdAt;
}
