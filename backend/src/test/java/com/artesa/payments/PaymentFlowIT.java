package com.artesa.payments;

import com.artesa.orders.Order;
import com.artesa.orders.OrderRepository;
import com.artesa.orders.OrderService;
import com.artesa.orders.OrderStatus;
import com.artesa.orders.dto.CreateOrderRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Transactional
@Import(FakePaymentGateway.Config.class)
@TestPropertySource(properties = "artesa.payments.provider=fake")
class PaymentFlowIT {

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
    @Autowired FakePaymentGateway gateway;

    private Order seedOrder() {
        var req = new CreateOrderRequest(
            "flow@example.com", "Flow Test",
            "Calle 1", "CABA", null, "Argentina",
            null, null,
            List.of(new CreateOrderRequest.Item(1L, 1, null))
        );
        return orderService.create(req);
    }

    @Test
    void initiate_returnsInitPointAndStoresPreferenceId() throws Exception {
        Order order = seedOrder();

        mvc.perform(post("/api/orders/" + order.getReference() + "/payment"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.preferenceId").exists())
            .andExpect(jsonPath("$.initPoint").value(org.hamcrest.Matchers.containsString("fake.mp.local")));

        Order refreshed = orderRepo.findByReference(order.getReference()).orElseThrow();
        assertThat(refreshed.getPreferenceId()).isNotBlank();
    }

    @Test
    void initiate_returns404WhenOrderMissing() throws Exception {
        mvc.perform(post("/api/orders/ARTESA-NOPE/payment"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("ORDER_NOT_FOUND"));
    }

    @Test
    void webhook_approvedPayment_transitionsOrderToPaid() throws Exception {
        Order order = seedOrder();
        String paymentId = gateway.recordPayment(order.getReference(), "approved",
            "credit_card", new BigDecimal("342000.00"));

        String body = String.format("""
            {"action":"payment.updated","type":"payment","data":{"id":"%s"}}
            """, paymentId);

        mvc.perform(post("/api/webhooks/mercadopago")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk());

        Order refreshed = orderRepo.findByReference(order.getReference()).orElseThrow();
        assertThat(refreshed.getStatus()).isEqualTo(OrderStatus.PAID);
        assertThat(refreshed.getPaymentStatus()).isEqualTo("approved");
        assertThat(refreshed.getPaymentMethod()).isEqualTo("credit_card");
        assertThat(refreshed.getPaidAt()).isNotNull();
        assertThat(refreshed.getPaymentId()).isEqualTo(paymentId);
    }

    @Test
    void webhook_rejectedPayment_transitionsOrderToCancelled() throws Exception {
        Order order = seedOrder();
        String paymentId = gateway.recordPayment(order.getReference(), "rejected",
            "credit_card", new BigDecimal("342000.00"));

        mvc.perform(post("/api/webhooks/mercadopago?topic=payment&id=" + paymentId))
            .andExpect(status().isOk());

        Order refreshed = orderRepo.findByReference(order.getReference()).orElseThrow();
        assertThat(refreshed.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(refreshed.getPaymentStatus()).isEqualTo("rejected");
        assertThat(refreshed.getPaidAt()).isNull();
    }

    @Test
    void webhook_ignoresMerchantOrderNotifications() throws Exception {
        // No payment id in query, and type is merchant_order in body — should no-op with 200.
        String body = """
            {"type":"merchant_order","data":{"id":"999"}}""";
        mvc.perform(post("/api/webhooks/mercadopago")
                .contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk());
    }

    @Test
    void webhook_returns200EvenWhenPaymentUnknown() throws Exception {
        // Webhook must always 200 so MP does not retry forever. Internal errors go
        // to logs.
        mvc.perform(post("/api/webhooks/mercadopago?topic=payment&id=999999"))
            .andExpect(status().isOk());
    }

    @Test
    void webhook_isPublic() throws Exception {
        // Sanity: MP has no session with us — the endpoint must respond, not 401.
        mvc.perform(post("/api/webhooks/mercadopago?topic=payment&id=1"))
            .andExpect(status().isOk());
    }
}
