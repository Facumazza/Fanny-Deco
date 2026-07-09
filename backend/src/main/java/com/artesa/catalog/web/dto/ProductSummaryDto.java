package com.artesa.catalog.web.dto;

import com.artesa.catalog.domain.ProductBadge;
import java.math.BigDecimal;
import java.util.List;

public record ProductSummaryDto(
    Long id,
    String slug,
    String name,
    BigDecimal priceArs,
    String imageUrl,
    ProductBadge badge,
    BigDecimal ratingAvg,
    int ratingCount,
    String categorySlug,
    List<String> colors
) {}
