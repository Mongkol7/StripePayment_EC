package com.ecommerce.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCancelResponseDto {
    private String orderReference;
    private String stripeSubscriptionId;
    private String subscriptionStatus;
    private String message;
}
