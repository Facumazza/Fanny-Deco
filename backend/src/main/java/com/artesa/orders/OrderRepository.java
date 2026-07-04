package com.artesa.orders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>,
                                          JpaSpecificationExecutor<Order> {
    Optional<Order> findByReference(String reference);
    boolean existsByReference(String reference);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
