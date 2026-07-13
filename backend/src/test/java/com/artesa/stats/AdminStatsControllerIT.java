package com.artesa.stats;

import com.artesa.orders.Order;
import com.artesa.orders.OrderRepository;
import com.artesa.orders.OrderService;
import com.artesa.orders.OrderStatus;
import com.artesa.orders.admin.AdminOrderService;
import com.artesa.orders.dto.CreateOrderRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional
class AdminStatsControllerIT {

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
    @Autowired AdminOrderService adminOrderService;
    @Autowired OrderRepository orderRepo;

    @Test
    void unauthenticated_returns401() throws Exception {
        mvc.perform(get("/api/admin/stats"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void snapshot_emptyDb_returnsZeros() throws Exception {
        mvc.perform(get("/api/admin/stats"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.today.revenueArs").value(0))
            .andExpect(jsonPath("$.today.orderCount").value(0))
            .andExpect(jsonPath("$.last7Days.orderCount").value(0))
            .andExpect(jsonPath("$.thisMonth.orderCount").value(0))
            .andExpect(jsonPath("$.orderCountsByStatus.PENDING").value(0))
            .andExpect(jsonPath("$.orderCountsByStatus.PAID").value(0))
            .andExpect(jsonPath("$.topProducts.length()").value(0));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void snapshot_withOrders_aggregatesCorrectly() throws Exception {
        // Create 3 orders: 1 pending, 1 paid (should count for revenue), 1 delivered.
        Order pending = seedOrder(1L, 2);        // 342000 * 2 = 684000
        Order paid    = seedOrder(2L, 1);        // 198000
        Order delivered = seedOrder(11L, 3);     // 50400 * 3 = 151200

        adminOrderService.updateStatus(paid.getId(),      OrderStatus.PAID);
        adminOrderService.updateStatus(delivered.getId(), OrderStatus.DELIVERED);

        mvc.perform(get("/api/admin/stats"))
            .andExpect(status().isOk())
            // Only PAID (198000) + DELIVERED (151200) count for revenue; PENDING excluded.
            .andExpect(jsonPath("$.today.revenueArs").value(349200))
            .andExpect(jsonPath("$.today.orderCount").value(3))     // count is ALL orders
            .andExpect(jsonPath("$.orderCountsByStatus.PENDING").value(1))
            .andExpect(jsonPath("$.orderCountsByStatus.PAID").value(1))
            .andExpect(jsonPath("$.orderCountsByStatus.DELIVERED").value(1))
            .andExpect(jsonPath("$.orderCountsByStatus.CANCELLED").value(0))
            // Top products only include revenue-eligible orders (PAID+DELIVERED).
            .andExpect(jsonPath("$.topProducts.length()").value(2))
            .andExpect(jsonPath("$.topProducts[0].unitsSold").value(3))  // taza-ritual
            .andExpect(jsonPath("$.topProducts[0].slug").value("taza-ritual"));

        // silence unused warning
        assert pending != null;
    }

    private Order seedOrder(long productId, int qty) {
        var req = new CreateOrderRequest(
            "s@example.com", "Stats Test",
            "Calle 1", "CABA", null, "Argentina",
            null, null,
            List.of(new CreateOrderRequest.Item(productId, qty, null))
        );
        return orderService.create(req);
    }
}
