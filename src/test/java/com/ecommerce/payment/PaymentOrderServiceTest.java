package com.ecommerce.payment;

import com.ecommerce.payment.dto.OrderReceiptDto;
import com.ecommerce.payment.model.entity.PaymentOrder;
import com.ecommerce.payment.model.entity.PaymentStatus;
import com.ecommerce.payment.repository.PaymentOrderRepository;
import com.ecommerce.payment.service.PaymentOrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PaymentOrderServiceTest {

    @Autowired
    private PaymentOrderService paymentOrderService;

    @Autowired
    private PaymentOrderRepository orderRepository;

    @Test
    @DisplayName("Should persist and retrieve order with DAILY subscription payment type")
    void testDailySubscriptionPersistence() {
        String orderRef = "ORD-TEST-SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        PaymentOrder order = PaymentOrder.builder()
                .orderReference(orderRef)
                .amount(new BigDecimal("0.99"))
                .currency("USD")
                .status(PaymentStatus.PENDING)
                .customerName("VIP Member")
                .customerEmail("vip@example.com")
                .description("VIP Engineering Daily Pass")
                .paymentType("SUBSCRIPTION")
                .billingInterval("DAY")
                .subscriptionStatus("ACTIVE")
                .stripeSubscriptionId("sub_test_daily_123")
                .build();

        orderRepository.save(order);

        Optional<PaymentOrder> retrieved = orderRepository.findByOrderReference(orderRef);
        assertTrue(retrieved.isPresent());
        assertEquals("SUBSCRIPTION", retrieved.get().getPaymentType());
        assertEquals("DAY", retrieved.get().getBillingInterval());
        assertEquals("ACTIVE", retrieved.get().getSubscriptionStatus());
        assertEquals("sub_test_daily_123", retrieved.get().getStripeSubscriptionId());

        // Test receipt retrieval mapping
        OrderReceiptDto receipt = paymentOrderService.getReceipt(orderRef);
        assertNotNull(receipt);
        assertEquals("SUBSCRIPTION", receipt.getPaymentType());
        assertEquals("DAY", receipt.getBillingInterval());
        assertEquals("ACTIVE", receipt.getSubscriptionStatus());
        assertEquals("sub_test_daily_123", receipt.getStripeSubscriptionId());
    }

    @Test
    @DisplayName("Should find order by Stripe subscription ID")
    void testFindByStripeSubscriptionId() {
        String subId = "sub_test_query_" + UUID.randomUUID().toString().substring(0, 8);
        String orderRef = "ORD-SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PaymentOrder order = PaymentOrder.builder()
                .orderReference(orderRef)
                .amount(new BigDecimal("0.99"))
                .currency("USD")
                .status(PaymentStatus.PENDING)
                .customerName("Query Member")
                .customerEmail("query@example.com")
                .description("VIP Pass")
                .paymentType("SUBSCRIPTION")
                .billingInterval("DAY")
                .subscriptionStatus("ACTIVE")
                .stripeSubscriptionId(subId)
                .build();

        orderRepository.save(order);

        Optional<PaymentOrder> found = orderRepository.findByStripeSubscriptionId(subId);
        assertTrue(found.isPresent());
        assertEquals(orderRef, found.get().getOrderReference());
    }
}
