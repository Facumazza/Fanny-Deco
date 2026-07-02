package com.artesa.catalog.web.dto;

import com.artesa.catalog.domain.ProductBadge;
import java.math.BigDecimal;
import java.util.List;

public record ProductDetailDto(
    Long id,
    String slug,
    String name,
    BigDecimal priceUsd,
    String imageUrl,
    ProductBadge badge,
    BigDecimal ratingAvg,
    int ratingCount,
    String categorySlug,
    String categoryName,
    String description,
    List<String> colors
) {}
