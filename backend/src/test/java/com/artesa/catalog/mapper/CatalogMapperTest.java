package com.artesa.catalog.mapper;

import com.artesa.catalog.domain.*;
import com.artesa.catalog.web.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CatalogMapperTest {

    private final CatalogMapper mapper = new CatalogMapper();

    @Test
    void toDto_mapsCategory() {
        Category c = new Category();
        ReflectionTestUtils.setField(c, "id", 1L);
        ReflectionTestUtils.setField(c, "slug", "carteras-cuero");
        ReflectionTestUtils.setField(c, "name", "Carteras de Cuero");
        ReflectionTestUtils.setField(c, "subtitle", "Full-grain");
        ReflectionTestUtils.setField(c, "imageUrl", "https://x/y.jpg");
        ReflectionTestUtils.setField(c, "displayOrder", 1);

        CategoryDto dto = mapper.toDto(c);

        assertThat(dto).isEqualTo(new CategoryDto(1L, "carteras-cuero", "Carteras de Cuero",
                                                  "Full-grain", "https://x/y.jpg"));
    }

    @Test
    void toSummary_flattensColorsAndIncludesCategorySlug() {
        Category c = new Category();
        ReflectionTestUtils.setField(c, "slug", "carteras-cuero");

        Product p = new Product();
        ReflectionTestUtils.setField(p, "id", 10L);
        ReflectionTestUtils.setField(p, "slug", "bolso-tote-milano");
        ReflectionTestUtils.setField(p, "name", "Bolso Tote Milano");
        ReflectionTestUtils.setField(p, "priceUsd", new BigDecimal("285.00"));
        ReflectionTestUtils.setField(p, "imageUrl", "https://x/img.jpg");
        ReflectionTestUtils.setField(p, "badge", ProductBadge.MAS_VENDIDO);
        ReflectionTestUtils.setField(p, "ratingAvg", new BigDecimal("5.0"));
        ReflectionTestUtils.setField(p, "ratingCount", 128);
        ReflectionTestUtils.setField(p, "category", c);

        ProductColor c1 = new ProductColor();
        ReflectionTestUtils.setField(c1, "hex", "#6B4029");
        ReflectionTestUtils.setField(c1, "displayOrder", 1);
        ProductColor c2 = new ProductColor();
        ReflectionTestUtils.setField(c2, "hex", "#2B2A28");
        ReflectionTestUtils.setField(c2, "displayOrder", 2);
        ReflectionTestUtils.setField(p, "colors", List.of(c1, c2));

        ProductSummaryDto dto = mapper.toSummary(p);

        assertThat(dto.id()).isEqualTo(10L);
        assertThat(dto.categorySlug()).isEqualTo("carteras-cuero");
        assertThat(dto.badge()).isEqualTo(ProductBadge.MAS_VENDIDO);
        assertThat(dto.colors()).containsExactly("#6B4029", "#2B2A28");
    }

    @Test
    void toDetail_includesDescriptionAndCategoryName() {
        Category c = new Category();
        ReflectionTestUtils.setField(c, "slug", "carteras-cuero");
        ReflectionTestUtils.setField(c, "name", "Carteras de Cuero");

        Product p = new Product();
        ReflectionTestUtils.setField(p, "id", 10L);
        ReflectionTestUtils.setField(p, "slug", "bolso-tote-milano");
        ReflectionTestUtils.setField(p, "name", "Bolso Tote Milano");
        ReflectionTestUtils.setField(p, "priceUsd", new BigDecimal("285.00"));
        ReflectionTestUtils.setField(p, "imageUrl", "https://x/img.jpg");
        ReflectionTestUtils.setField(p, "ratingAvg", new BigDecimal("5.0"));
        ReflectionTestUtils.setField(p, "ratingCount", 128);
        ReflectionTestUtils.setField(p, "category", c);
        ReflectionTestUtils.setField(p, "description", "Bolso premium.");
        ReflectionTestUtils.setField(p, "colors", List.of());

        ProductDetailDto dto = mapper.toDetail(p);

        assertThat(dto.description()).isEqualTo("Bolso premium.");
        assertThat(dto.categoryName()).isEqualTo("Carteras de Cuero");
        assertThat(dto.categorySlug()).isEqualTo("carteras-cuero");
    }

    @Test
    void toDto_mapsReview() {
        Review r = new Review();
        ReflectionTestUtils.setField(r, "id", 1L);
        ReflectionTestUtils.setField(r, "authorName", "María G.");
        ReflectionTestUtils.setField(r, "rating", (short) 5);
        ReflectionTestUtils.setField(r, "body", "Excelente");
        Instant ts = Instant.parse("2026-06-10T14:00:00Z");
        ReflectionTestUtils.setField(r, "createdAt", ts);

        ReviewDto dto = mapper.toDto(r);

        assertThat(dto).isEqualTo(new ReviewDto(1L, "María G.", 5, "Excelente", ts));
    }

    @Test
    void toPage_wrapsSpringPageIntoPageDto() {
        Page<String> src = new PageImpl<>(List.of("a", "b"), PageRequest.of(0, 12), 25);
        PageDto<String> out = mapper.toPage(src, s -> s.toUpperCase());

        assertThat(out.content()).containsExactly("A", "B");
        assertThat(out.page()).isZero();
        assertThat(out.size()).isEqualTo(12);
        assertThat(out.totalElements()).isEqualTo(25);
        assertThat(out.totalPages()).isEqualTo(3);
    }
}
