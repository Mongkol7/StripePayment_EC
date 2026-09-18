package com.ecommerce.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequestDto {

    @DecimalMin(value = "0.50", message = "Minimum refund amount is $0.50 USD")
    private BigDecimal amount;

    private String reason;
}
