package com.artesa.reviews;

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

import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional
class AdminReviewControllerIT {

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
        mvc.perform(get("/api/admin/reviews"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void list_returnsSeededReviewsNewestFirst() throws Exception {
        mvc.perform(get("/api/admin/reviews"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(6))
            // V3 seed's newest review is Valentina R. (2 days ago).
            .andExpect(jsonPath("$[0].authorName").value("Valentina R."))
            .andExpect(jsonPath("$[0].productName").value("BOLSO TOTE MILANO"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_happyPath() throws Exception {
        String body = """
            {
              "authorName": "  Test User  ",
              "rating": 5,
              "body": "Excelente producto",
              "location": "Buenos Aires",
              "productName": "TAZA RITUAL"
            }""";
        mvc.perform(post("/api/admin/reviews")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.authorName").value("Test User"))   // trimmed
            .andExpect(jsonPath("$.rating").value(5))
            .andExpect(jsonPath("$.location").value("Buenos Aires"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_rejectsOutOfRangeRating() throws Exception {
        String body = """
            {"authorName":"X","rating":10,"body":"y"}""";
        mvc.perform(post("/api/admin/reviews")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_rejectsBlankAuthor() throws Exception {
        String body = """
            {"authorName":"","rating":5,"body":"y"}""";
        mvc.perform(post("/api/admin/reviews")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void update_replacesFields() throws Exception {
        String body = """
            {
              "authorName": "Valentina R. (edited)",
              "rating": 4,
              "body": "Actualicé la reseña.",
              "location": null,
              "productName": null
            }""";
        mvc.perform(put("/api/admin/reviews/1")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authorName").value("Valentina R. (edited)"))
            .andExpect(jsonPath("$.rating").value(4))
            .andExpect(jsonPath("$.location").value(nullValue()))
            .andExpect(jsonPath("$.productName").value(nullValue()));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void get_returns404WhenMissing() throws Exception {
        mvc.perform(get("/api/admin/reviews/99999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("REVIEW_NOT_FOUND"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void delete_returns204AndRemoves() throws Exception {
        mvc.perform(delete("/api/admin/reviews/1"))
            .andExpect(status().isNoContent());

        mvc.perform(get("/api/admin/reviews/1"))
            .andExpect(status().isNotFound());
    }
}
