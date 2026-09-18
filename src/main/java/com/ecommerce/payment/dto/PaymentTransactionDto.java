package com.ecommerce.payment.dto;

import com.ecommerce.payment.model.entity.PaymentTransactionType;
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
public class PaymentTransactionDto {
    private Long id;
    private String orderReference;
    private PaymentTransactionType transactionType;
    private BigDecimal amount;
    private String currency;
    private String stripeChargeId;
    private String stripePaymentIntentId;
    private String stripeRefundId;
    private String paymentMethodType;
    private String cardBrand;
    private String cardLast4;
    private String failureCode;
    private String failureMessage;
    private LocalDateTime createdAt;
}
