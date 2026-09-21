package com.ecommerce.payment.repository;

import com.ecommerce.payment.model.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderReference(String orderReference);
    Optional<PaymentOrder> findByStripeSessionId(String stripeSessionId);
    List<PaymentOrder> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);
    List<PaymentOrder> findByOrderReferenceContainingIgnoreCaseOrderByCreatedAtDesc(String orderReference);
    List<PaymentOrder> findTop20ByOrderByCreatedAtDesc();

    @Query("SELECT o FROM PaymentOrder o WHERE " +
           "LOWER(o.orderReference) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(coalesce(o.customerName, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(coalesce(o.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY o.createdAt DESC")
    List<PaymentOrder> searchByKeyword(@Param("keyword") String keyword);
}
