package com.artesa.catalog.admin.dto;

import com.artesa.catalog.domain.ProductBadge;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record ProductUpsertRequest(
    @NotBlank @Size(max = 200)
    String name,

    @NotBlank
    @Size(max = 120)
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
             message = "El slug debe ser minúsculas, dígitos y guiones (ej: bolso-tote-milano)")
    String slug,

    @Size(max = 5000)
    String description,

    @NotNull
    @DecimalMin(value = "0.00", inclusive = true, message = "El precio no puede ser negativo")
    @Digits(integer = 8, fraction = 2)
    BigDecimal priceUsd,

    @NotBlank
    @Size(max = 2000)
    String imageUrl,

    ProductBadge badge,

    @NotNull
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "5.0")
    @Digits(integer = 1, fraction = 1)
    BigDecimal ratingAvg,

    @NotNull
    @Min(0)
    Integer ratingCount,

    @NotNull
    Long categoryId,

    List<@Pattern(regexp = "^#[0-9A-Fa-f]{6}$",
                  message = "Cada color debe ser un hex de 6 dígitos con # (ej: #6B4029)") String> colors
) {}
