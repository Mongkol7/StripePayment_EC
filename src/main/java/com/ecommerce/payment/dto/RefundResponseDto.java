package com.ecommerce.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponseDto {
    private String orderReference;
    private String refundId;
    private BigDecimal amountRefunded;
    private String currency;
    private String status;
    private String message;
}
