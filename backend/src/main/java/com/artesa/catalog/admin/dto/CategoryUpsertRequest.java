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
    Integer displayOrder,

    // Reglas de compra. Ambos son opcionales en el JSON: si vienen null los
    // tratamos como false, así los clientes viejos del admin siguen andando.
    Boolean requiresCompanion,

    Boolean isCompanion
) {
    public boolean requiresCompanionOrFalse() {
        return Boolean.TRUE.equals(requiresCompanion);
    }

    public boolean isCompanionOrFalse() {
        return Boolean.TRUE.equals(isCompanion);
    }
}
