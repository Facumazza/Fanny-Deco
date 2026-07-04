package com.artesa.orders;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByReference(String reference);
    boolean existsByReference(String reference);
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
