package com.artesa.catalog.admin.dto;

import jakarta.validation.constraints.*;

public record CategoryUpsertRequest(
    @NotBlank @Size(max = 120)
    String name,

    @NotBlank
    @Size(max = 80)
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
             message = "El slug debe ser minúsculas, dígitos y guiones")
    String slug,

    @Size(max = 200)
    String subtitle,

    @NotBlank
    @Size(max = 2000)
    String imageUrl,

    @NotNull
    @Min(0)
    Integer displayOrder
) {}
