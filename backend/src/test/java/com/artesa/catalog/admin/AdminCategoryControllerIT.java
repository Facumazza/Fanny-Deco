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
@Transactional
class AdminCategoryControllerIT {

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
    void unauthenticated_list_returns401() throws Exception {
        mvc.perform(get("/api/admin/categories"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listReturnsSeededCategoriesWithProductCounts() throws Exception {
        mvc.perform(get("/api/admin/categories"))
            .andExpect(status().isOk())
            // 4 del seed original + Accesorios, que agrega V13.
            .andExpect(jsonPath("$.length()").value(5))
            .andExpect(jsonPath("$[0].slug").value("carteras-cuero"))
            .andExpect(jsonPath("$[0].productCount").value(2))
            .andExpect(jsonPath("$[0].isCompanion").value(true))
            .andExpect(jsonPath("$[0].requiresCompanion").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listExposesCompanionRulesOfAccesorios() throws Exception {
        mvc.perform(get("/api/admin/categories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.slug == 'accesorios')].requiresCompanion")
                .value(org.hamcrest.Matchers.contains(true)))
            .andExpect(jsonPath("$[?(@.slug == 'accesorios')].isCompanion")
                .value(org.hamcrest.Matchers.contains(false)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getByIdReturnsCategory() throws Exception {
        mvc.perform(get("/api/admin/categories/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.slug").value("carteras-cuero"))
            .andExpect(jsonPath("$.displayOrder").isNumber())
            .andExpect(jsonPath("$.productCount").value(2));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_happyPath() throws Exception {
        // Ojo: "accesorios" ya existe desde V13, así que este test usa otro slug.
        String body = """
            {
              "name": "Bijouterie",
              "slug": "bijouterie",
              "subtitle": "Aros y collares",
              "imageUrl": "https://example.com/img.jpg",
              "displayOrder": 6,
              "requiresCompanion": true,
              "isCompanion": false
            }""";
        mvc.perform(post("/api/admin/categories")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.slug").value("bijouterie"))
            .andExpect(jsonPath("$.requiresCompanion").value(true))
            .andExpect(jsonPath("$.isCompanion").value(false))
            .andExpect(jsonPath("$.productCount").value(0));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_defaultsCompanionRulesToFalseWhenOmitted() throws Exception {
        // Los flags son opcionales en el JSON: si no vienen, la categoría se
        // vende normalmente y no habilita a nadie.
        String body = """
            {
              "name": "Sin reglas",
              "slug": "sin-reglas",
              "imageUrl": "https://example.com/img.jpg",
              "displayOrder": 7
            }""";
        mvc.perform(post("/api/admin/categories")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.requiresCompanion").value(false))
            .andExpect(jsonPath("$.isCompanion").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCategory_conflictOnDuplicateSlug() throws Exception {
        String body = """
            {
              "name": "Duplicado",
              "slug": "carteras-cuero",
              "imageUrl": "https://example.com/img.jpg",
              "displayOrder": 10
            }""";
        mvc.perform(post("/api/admin/categories")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("SLUG_ALREADY_EXISTS"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateCategory_happyPath() throws Exception {
        String body = """
            {
              "name": "Carteras de Cuero — Renovado",
              "slug": "carteras-cuero",
              "subtitle": "Nuevo subtítulo",
              "imageUrl": "https://example.com/new.jpg",
              "displayOrder": 1,
              "requiresCompanion": false,
              "isCompanion": true
            }""";
        mvc.perform(put("/api/admin/categories/1")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Carteras de Cuero — Renovado"))
            .andExpect(jsonPath("$.subtitle").value("Nuevo subtítulo"))
            // El form del admin siempre manda los flags: acá se verifica que
            // el PUT los conserva en vez de apagarlos.
            .andExpect(jsonPath("$.isCompanion").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCategory_conflictWhenHasProducts() throws Exception {
        mvc.perform(delete("/api/admin/categories/1"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.code").value("CATEGORY_IN_USE"))
            .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("2 producto")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCategory_succeedsWhenEmpty() throws Exception {
        // Create an empty category, then delete it.
        String create = """
            {
              "name": "Temporal",
              "slug": "temporal-para-borrar",
              "imageUrl": "https://example.com/img.jpg",
              "displayOrder": 99
            }""";
        String resp = mvc.perform(post("/api/admin/categories")
                .contentType(MediaType.APPLICATION_JSON).content(create))
            .andExpect(status().isCreated())
            .andReturn().getResponse().getContentAsString();
        Long id = Long.valueOf(resp.replaceAll(".*\"id\":(\\d+).*", "$1"));

        mvc.perform(delete("/api/admin/categories/" + id))
            .andExpect(status().isNoContent());
    }
}
