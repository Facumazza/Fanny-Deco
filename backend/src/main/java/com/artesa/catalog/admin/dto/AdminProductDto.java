package com.artesa.catalog.admin.dto;

import com.artesa.catalog.domain.ProductBadge;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminProductDto(
    Long id,
    String slug,
    String name,
    String description,
    BigDecimal priceUsd,
    String imageUrl,
    ProductBadge badge,
    BigDecimal ratingAvg,
    int ratingCount,
    Long categoryId,
    String categoryName,
    List<String> colors,
    Instant createdAt
) {}
