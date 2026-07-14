package com.artesa.payments;

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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional
@Import({FakeEmailService.Config.class, FakePaymentGateway.Config.class})
@TestPropertySource(properties = {
    "artesa.emails.provider=fake",
    "artesa.payments.provider=fake"
})
class RefundFlowIT {

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
    @Autowired PaymentService paymentService;
    @Autowired OrderRepository orderRepo;
    @Autowired FakePaymentGateway gateway;
    @Autowired FakeEmailService email;

    private Order paidOrder() {
        // Create then simulate an MP-approved payment so paymentId is set.
        var req = new CreateOrderRequest(
            "buyer@example.com", "Comprador",
            "Calle 1", "CABA", null, "Argentina",
            null, null,
            List.of(new CreateOrderRequest.Item(1L, 1, null))
        );
        Order o = orderService.create(req);
        String pid = gateway.recordPayment(o.getReference(), "approved",
            "credit_card", new BigDecimal("342000.00"));
        paymentService.applyPaymentUpdate(pid);
        return orderRepo.findById(o.getId()).orElseThrow();
    }

    @BeforeEach
    void resetEmails() { email.reset(); }

    @Test
    void unauthenticated_returns401() throws Exception {
        Order o = paidOrder();
        mvc.perform(post("/api/admin/orders/" + o.getId() + "/refund"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void refund_transitionsOrderAndEmailsCustomer() throws Exception {
        Order o = paidOrder();
        email.reset();

        mvc.perform(post("/api/admin/orders/" + o.getId() + "/refund"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("REFUNDED"))
            .andExpect(jsonPath("$.paymentStatus").value("refunded"));

        Order fresh = orderRepo.findById(o.getId()).orElseThrow();
        assertThat(fresh.getStatus()).isEqualTo(OrderStatus.REFUNDED);
        assertThat(gateway.refundedIds).contains(o.getPaymentId());
        assertThat(email.sent).hasSize(1);
        assertThat(email.sent.get(0).subject()).contains("Reembolso procesado");
        assertThat(email.sent.get(0).to()).isEqualTo("buyer@example.com");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void refund_rejectsWhenNoPaymentAttached() throws Exception {
        // Order without a payment id (never paid) — refund makes no sense.
        var req = new CreateOrderRequest(
            "x@example.com", "Sin Pago",
            "Calle 1", "CABA", null, "Argentina",
            null, null,
            List.of(new CreateOrderRequest.Item(1L, 1, null))
        );
        Order o = orderService.create(req);

        mvc.perform(post("/api/admin/orders/" + o.getId() + "/refund"))
            .andExpect(status().isBadGateway())
            .andExpect(jsonPath("$.code").value("NO_PAYMENT_TO_REFUND"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void refund_rejectsWhenAlreadyRefunded() throws Exception {
        Order o = paidOrder();
        // First refund succeeds.
        paymentService.refundOrder(orderRepo.findById(o.getId()).orElseThrow());

        // Second refund attempt should be blocked.
        mvc.perform(post("/api/admin/orders/" + o.getId() + "/refund"))
            .andExpect(status().isBadGateway())
            .andExpect(jsonPath("$.code").value("ALREADY_TERMINAL"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void refund_returns404WhenOrderMissing() throws Exception {
        mvc.perform(post("/api/admin/orders/99999/refund"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"));
    }
}
