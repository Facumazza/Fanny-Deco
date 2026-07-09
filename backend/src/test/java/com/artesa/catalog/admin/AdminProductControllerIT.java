package com.artesa.catalog.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional  // rolls back after each test so writes don't leak across tests
class AdminProductControllerIT {

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

    // ------- Unauthenticated: everything under /api/admin/products should 401 -------

    @Test
    void unauthenticated_list_returns401() throws Exception {
        mvc.perform(get("/api/admin/products"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void unauthenticated_create_returns401() throws Exception {
        mvc.perform(post("/api/admin/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isUnauthorized());
    }

    // ------- Authenticated flows -------

    @Test
    @WithMockUser(roles = "ADMIN")
    void listReturnsSeededProducts() throws Exception {
        mvc.perform(get("/api/admin/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(12))
            .andExpect(jsonPath("$.totalElements").value(12))
            .andExpect(jsonPath("$.content[0].categoryId").isNumber());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listFiltersByQ() throws Exception {
        mvc.perform(get("/api/admin/products?q=milano"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].slug").value("bolso-tote-milano"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getByIdReturnsProduct() throws Exception {
        mvc.perform(get("/api/admin/products/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.slug").value("bolso-tote-milano"))
            .andExpect(jsonPath("$.categoryId").isNumber())
            .andExpect(jsonPath("$.colors.length()").value(3));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getByIdReturns404WhenMissing() throws Exception {
        mvc.perform(get("/api/admin/products/9999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_happyPath() throws Exception {
        String body = """
            {
              "name": "Test Producto",
              "slug": "test-producto-nuevo",
              "description": "Un producto de prueba.",
              "priceArs": 199.99,
              "imageUrl": "https://example.com/img.jpg",
              "badge": "NUEVO",
              "ratingAvg": 4.5,
              "ratingCount": 0,
              "categoryId": 1,
              "colors": ["#AABBCC", "#112233"]
            }""";

        mvc.perform(post("/api/admin/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.slug").value("test-producto-nuevo"))
            .andExpect(jsonPath("$.priceArs").value(199.99))
            .andExpect(jsonPath("$.badge").value("NUEVO"))
            .andExpect(jsonPath("$.colors.length()").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_conflictOnDuplicateSlug() throws Exception {
        String body = """
            {
              "name": "Duplicado",
              "slug": "bolso-tote-milano",
              "priceArs": 100.00,
              "imageUrl": "https://example.com/img.jpg",
              "ratingAvg": 4.0,
              "ratingCount": 0,
              "categoryId": 1,
              "colors": []
            }""";
        mvc.perform(post("/api/admin/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("SLUG_ALREADY_EXISTS"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_badRequestOnInvalidSlug() throws Exception {
        String body = """
            {
              "name": "Slug malo",
              "slug": "Slug Con Mayusc y Espacios",
              "priceArs": 100.00,
              "imageUrl": "https://example.com/img.jpg",
              "ratingAvg": 4.0,
              "ratingCount": 0,
              "categoryId": 1,
              "colors": []
            }""";
        mvc.perform(post("/api/admin/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createProduct_badRequestOnMissingCategory() throws Exception {
        String body = """
            {
              "name": "Sin categoría",
              "slug": "sin-categoria",
              "priceArs": 100.00,
              "imageUrl": "https://example.com/img.jpg",
              "ratingAvg": 4.0,
              "ratingCount": 0,
              "categoryId": 99999,
              "colors": []
            }""";
        mvc.perform(post("/api/admin/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("CATEGORY_NOT_FOUND"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateProduct_happyPath() throws Exception {
        String body = """
            {
              "name": "Bolso Tote Milano Renovado",
              "slug": "bolso-tote-milano",
              "description": "Nueva descripción.",
              "priceArs": 299.00,
              "imageUrl": "https://example.com/new.jpg",
              "badge": "MAS_VENDIDO",
              "ratingAvg": 4.9,
              "ratingCount": 200,
              "categoryId": 1,
              "colors": ["#000000"]
            }""";
        mvc.perform(put("/api/admin/products/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Bolso Tote Milano Renovado"))
            .andExpect(jsonPath("$.priceArs").value(299.00))
            .andExpect(jsonPath("$.colors.length()").value(1))
            .andExpect(jsonPath("$.colors[0]").value("#000000"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteProduct_returns204() throws Exception {
        // Create one first so we don't disturb other tests' expectations of the seed count.
        String create = """
            {
              "name": "Para Borrar",
              "slug": "para-borrar",
              "priceArs": 10.00,
              "imageUrl": "https://example.com/img.jpg",
              "ratingAvg": 3.0,
              "ratingCount": 0,
              "categoryId": 1,
              "colors": []
            }""";
        String location = mvc.perform(post("/api/admin/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(create))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        Long id = Long.valueOf(location.replaceAll(".*\"id\":(\\d+).*", "$1"));

        mvc.perform(delete("/api/admin/products/" + id))
            .andExpect(status().isNoContent());

        mvc.perform(get("/api/admin/products/" + id))
            .andExpect(status().isNotFound());
    }
}
