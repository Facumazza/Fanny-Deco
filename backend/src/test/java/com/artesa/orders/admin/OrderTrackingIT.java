package com.artesa.orders.admin;

import com.artesa.emails.FakeEmailService;
import com.artesa.orders.Order;
import com.artesa.orders.OrderRepository;
import com.artesa.orders.OrderService;
import com.artesa.orders.OrderStatus;
import com.artesa.orders.dto.CreateOrderRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional
@Import({FakeEmailService.Config.class})
@TestPropertySource(properties = {
    "artesa.emails.provider=fake"
})
class OrderTrackingIT {

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
    @Autowired FakeEmailService email;

    private Order seed() {
        var req = new CreateOrderRequest(
            "customer@example.com", "Cliente",
            "Calle 1", "CABA", null, "Argentina",
            null, null,
            List.of(new CreateOrderRequest.Item(1L, 1, null))
        );
        return orderService.create(req);
    }

    @BeforeEach
    void reset() { email.reset(); }

    @Test
    void unauthenticated_returns401() throws Exception {
        Order o = seed();
        mvc.perform(put("/api/admin/orders/" + o.getId() + "/tracking")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"trackingInfo\":\"OCA E123\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateTracking_storesAndTrimsWhitespace() throws Exception {
        Order o = seed();

        mvc.perform(put("/api/admin/orders/" + o.getId() + "/tracking")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"trackingInfo\":\"  OCA E1234567AR  \"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.trackingInfo").value("OCA E1234567AR"));

        Order fresh = orderRepo.findById(o.getId()).orElseThrow();
        assertThat(fresh.getTrackingInfo()).isEqualTo("OCA E1234567AR");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateTracking_blankOrNullClears() throws Exception {
        Order o = seed();
        adminOrderService.updateTracking(o.getId(), "was set");

        mvc.perform(put("/api/admin/orders/" + o.getId() + "/tracking")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"trackingInfo\":\"   \"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.trackingInfo").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateTracking_rejectsOverlyLong() throws Exception {
        Order o = seed();
        String tooLong = "x".repeat(301);
        mvc.perform(put("/api/admin/orders/" + o.getId() + "/tracking")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"trackingInfo\":\"" + tooLong + "\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shippedEmail_includesTrackingWhenSet() {
        Order o = seed();
        adminOrderService.updateTracking(o.getId(), "OCA E9876543AR");
        email.reset();

        adminOrderService.updateStatus(o.getId(), OrderStatus.SHIPPED);

        assertThat(email.sent).hasSize(1);
        String html = email.sent.get(0).html();
        assertThat(html).contains("OCA E9876543AR");
        assertThat(html).contains("seguimiento");
    }

    @Test
    void shippedEmail_omitsTrackingBlockWhenNoTracking() {
        Order o = seed();  // tracking left null
        email.reset();

        adminOrderService.updateStatus(o.getId(), OrderStatus.SHIPPED);

        assertThat(email.sent).hasSize(1);
        String html = email.sent.get(0).html();
        assertThat(html).doesNotContain("Código de seguimiento");
    }
}
