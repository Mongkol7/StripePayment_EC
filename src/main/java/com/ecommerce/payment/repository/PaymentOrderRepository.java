package com.ecommerce.payment.repository;

import com.ecommerce.payment.model.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderReference(String orderReference);
    Optional<PaymentOrder> findByStripeSessionId(String stripeSessionId);
    java.util.List<PaymentOrder> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);
    java.util.List<PaymentOrder> findByOrderReferenceContainingIgnoreCaseOrderByCreatedAtDesc(String orderReference);
    java.util.List<PaymentOrder> findTop20ByOrderByCreatedAtDesc();
}
