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
    // Copia de los flags de la categoría, para que el carrito pueda decidir
    // sin tener que volver a pedir /api/categories.
    boolean requiresCompanion,
    boolean isCompanion,
    List<String> colors
) {}
