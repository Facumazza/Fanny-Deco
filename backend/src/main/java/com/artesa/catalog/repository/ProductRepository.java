package com.artesa.catalog.repository;

import com.artesa.catalog.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>,
                                            JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);
    long countByCategoryId(Long categoryId);
}
