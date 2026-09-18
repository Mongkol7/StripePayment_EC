package com.ecommerce.payment.repository;

import com.ecommerce.payment.model.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByOrderReferenceOrderByCreatedAtDesc(String orderReference);
    List<PaymentTransaction> findByPaymentOrderIdOrderByCreatedAtDesc(Long paymentOrderId);
}
