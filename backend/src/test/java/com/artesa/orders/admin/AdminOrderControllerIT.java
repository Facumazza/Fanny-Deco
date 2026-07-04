package com.artesa.orders.admin;

import com.artesa.orders.OrderRepository;
import com.artesa.orders.OrderService;
import com.artesa.orders.dto.CreateOrderRequest;
import org.junit.jupiter.api.BeforeEach;
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

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional
class AdminOrderControllerIT {

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
    @Autowired OrderService orderService;
    @Autowired OrderRepository orderRepo;

    private Long seededOrderId;
    private String seededReference;

    @BeforeEach
    void seedOrder() {
        var req = new CreateOrderRequest(
            "seed@example.com", "Cliente Seed",
            "Calle Seed 100", "CABA", "1000", "Argentina",
            null, null,
            List.of(new CreateOrderRequest.Item(1L, 2, "#6B4029"))
        );
        var created = orderService.create(req);
        seededOrderId = created.getId();
        seededReference = created.getReference();
    }

    @Test
    void unauthenticated_list_returns401() throws Exception {
        mvc.perform(get("/api/admin/orders"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listReturnsSeededOrder() throws Exception {
        mvc.perform(get("/api/admin/orders"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.content[0].reference").value(seededReference))
            .andExpect(jsonPath("$.content[0].status").value("PENDING"))
            .andExpect(jsonPath("$.content[0].itemCount").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listFiltersByStatus() throws Exception {
        mvc.perform(get("/api/admin/orders?status=DELIVERED"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(0));
        mvc.perform(get("/api/admin/orders?status=PENDING"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void listFiltersByEmail() throws Exception {
        mvc.perform(get("/api/admin/orders?q=seed"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(1));
        mvc.perform(get("/api/admin/orders?q=nomatch"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content.length()").value(0));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getByIdReturnsFullDetail() throws Exception {
        mvc.perform(get("/api/admin/orders/" + seededOrderId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(seededOrderId))
            .andExpect(jsonPath("$.reference").value(seededReference))
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].productName").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getByIdReturns404WhenMissing() throws Exception {
        mvc.perform(get("/api/admin/orders/99999"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_transitionsThroughValidStates() throws Exception {
        String body = """
            {"status": "PAID"}""";
        mvc.perform(put("/api/admin/orders/" + seededOrderId + "/status")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PAID"));

        mvc.perform(get("/api/admin/orders/" + seededOrderId))
            .andExpect(jsonPath("$.status").value("PAID"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_rejectsInvalidValue() throws Exception {
        String body = """
            {"status": "MAGIC"}""";
        mvc.perform(put("/api/admin/orders/" + seededOrderId + "/status")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isBadRequest());
    }
}
