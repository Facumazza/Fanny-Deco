package com.artesa.catalog.web.dto;

import com.artesa.catalog.admin.dto.AdminCategoryDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * El front lee `requiresCompanion` / `isCompanion` tal cual. Jackson tiene
 * un historial de recortarle el prefijo "is" a los booleanos (isCompanion ->
 * companion) cuando el accessor parece un is-getter, así que el nombre del
 * campo en el JSON se fija acá: si una actualización de Jackson cambia esa
 * convención, este test lo agarra en vez de romper el checkout en silencio.
 */
class CompanionRulesJsonTest {

    private final ObjectMapper json = new ObjectMapper();

    @Test
    void categoryDto_keepsCompanionFieldNames() throws Exception {
        String out = json.writeValueAsString(
            new CategoryDto(1L, "accesorios", "Accesorios", null, "https://x/y.jpg",
                            true, false));

        assertThat(out).contains("\"requiresCompanion\":true");
        assertThat(out).contains("\"isCompanion\":false");
        assertThat(out).doesNotContain("\"companion\":");
    }

    @Test
    void productSummaryDto_keepsCompanionFieldNames() throws Exception {
        String out = json.writeValueAsString(
            new ProductSummaryDto(1L, "llavero", "Llavero", new BigDecimal("25000.00"),
                                  "https://x/y.jpg", null, new BigDecimal("5.0"), 0,
                                  "accesorios", true, false, List.of()));

        assertThat(out).contains("\"requiresCompanion\":true");
        assertThat(out).contains("\"isCompanion\":false");
        assertThat(out).doesNotContain("\"companion\":");
    }

    @Test
    void adminCategoryDto_keepsCompanionFieldNames() throws Exception {
        String out = json.writeValueAsString(
            new AdminCategoryDto(1L, "carteras-cuero", "Carteras de Cuero", null,
                                 "https://x/y.jpg", 1, false, true, 2));

        assertThat(out).contains("\"requiresCompanion\":false");
        assertThat(out).contains("\"isCompanion\":true");
        assertThat(out).doesNotContain("\"companion\":");
    }

    @Test
    void categoryUpsertRequest_readsCompanionFlagsFromTheAdminForm() throws Exception {
        var req = json.readValue("""
            {
              "name": "Accesorios",
              "slug": "accesorios",
              "subtitle": null,
              "imageUrl": "https://x/y.jpg",
              "displayOrder": 5,
              "requiresCompanion": true,
              "isCompanion": false
            }""", com.artesa.catalog.admin.dto.CategoryUpsertRequest.class);

        assertThat(req.requiresCompanionOrFalse()).isTrue();
        assertThat(req.isCompanionOrFalse()).isFalse();
    }

    @Test
    void categoryUpsertRequest_treatsMissingFlagsAsFalse() throws Exception {
        var req = json.readValue("""
            {
              "name": "Sin reglas",
              "slug": "sin-reglas",
              "imageUrl": "https://x/y.jpg",
              "displayOrder": 7
            }""", com.artesa.catalog.admin.dto.CategoryUpsertRequest.class);

        assertThat(req.requiresCompanionOrFalse()).isFalse();
        assertThat(req.isCompanionOrFalse()).isFalse();
    }
}
