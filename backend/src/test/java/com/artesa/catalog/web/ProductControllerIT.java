package com.artesa.catalog.web;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ProductControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("artesa").withUsername("artesa").withPassword("artesa");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired MockMvc mvc;

    @Test
    void listsAllProductsWithDefaultPagination() throws Exception {
        mvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(12))
            .andExpect(jsonPath("$.page").value(0))
            .andExpect(jsonPath("$.size").value(12))
            .andExpect(jsonPath("$.totalElements").value(12))
            .andExpect(jsonPath("$.totalPages").value(1))
            .andExpect(jsonPath("$.content[0].slug").isNotEmpty())
            .andExpect(jsonPath("$.content[0].colors").isArray());
    }

    @Test
    void filtersByCategory() throws Exception {
        mvc.perform(get("/api/products?category=carteras-cuero"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(2))
            .andExpect(jsonPath("$.content[?(@.categorySlug != 'carteras-cuero')]").isEmpty());
    }

    @Test
    void filtersByBadge() throws Exception {
        mvc.perform(get("/api/products?badge=NUEVO"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[?(@.badge != 'NUEVO')]").isEmpty())
            .andExpect(jsonPath("$.content.length()").value(2));
    }

    @Test
    void searchByQuery() throws Exception {
        mvc.perform(get("/api/products?q=bolso"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(3));
    }

    @Test
    void clampsSizeAboveMaximum() throws Exception {
        mvc.perform(get("/api/products?size=999"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.size").value(48));
    }

    @Test
    void sortsByPriceAscending() throws Exception {
        mvc.perform(get("/api/products?sort=price,asc&size=48"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].priceUsd").value(42.00));
    }

    @Test
    void getBySlugReturnsDetail() throws Exception {
        mvc.perform(get("/api/products/bolso-tote-milano"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.slug").value("bolso-tote-milano"))
            .andExpect(jsonPath("$.name").value("Bolso Tote Milano"))
            .andExpect(jsonPath("$.description").isNotEmpty())
            .andExpect(jsonPath("$.categoryName").value("Carteras de Cuero"))
            .andExpect(jsonPath("$.colors.length()").value(3));
    }

    @Test
    void getBySlugReturns404WhenMissing() throws Exception {
        mvc.perform(get("/api/products/no-existe"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"))
            .andExpect(jsonPath("$.message").exists())
            .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void invalidBadgeReturns400() throws Exception {
        mvc.perform(get("/api/products?badge=NO_EXISTE"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }
}
