package com.ecommerce.payment.repository;

import com.ecommerce.payment.model.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderReference(String orderReference);
    Optional<PaymentOrder> findByStripeSessionId(String stripeSessionId);
}
