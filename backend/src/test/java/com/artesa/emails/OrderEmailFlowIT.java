package com.artesa.emails;

import com.artesa.orders.Order;
import com.artesa.orders.OrderRepository;
import com.artesa.orders.OrderService;
import com.artesa.orders.OrderStatus;
import com.artesa.orders.admin.AdminOrderService;
import com.artesa.orders.dto.CreateOrderRequest;
import com.artesa.payments.FakePaymentGateway;
import com.artesa.payments.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end verification that the OrderMailer fires the right templates on each
 * lifecycle transition. Uses a fake email service + a fake payment gateway so no
 * external calls are made.
 */
@SpringBootTest
@Testcontainers
@Transactional
@Import({FakeEmailService.Config.class, FakePaymentGateway.Config.class})
@TestPropertySource(properties = {
    "artesa.emails.provider=fake",
    "artesa.payments.provider=fake",
    "artesa.emails.admin-to=admin@artesa.com"
})
class OrderEmailFlowIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("artesa").withUsername("artesa").withPassword("artesa");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired FakeEmailService email;
    @Autowired FakePaymentGateway gateway;
    @Autowired OrderService orderService;
    @Autowired PaymentService paymentService;
    @Autowired AdminOrderService adminOrderService;
    @Autowired OrderRepository orderRepo;

    @BeforeEach
    void reset() { email.reset(); }

    private Order seed() {
        var req = new CreateOrderRequest(
            "customer@example.com", "Cliente Test",
            "Calle 1", "CABA", null, "Argentina",
            null, null,
            List.of(new CreateOrderRequest.Item(1L, 1, null))
        );
        return orderService.create(req);
    }

    @Test
    void onOrderCreated_sendsReceivedEmailToCustomer() {
        Order o = seed();
        assertThat(email.sent).hasSize(1);
        EmailMessage m = email.sent.get(0);
        assertThat(m.to()).isEqualTo("customer@example.com");
        assertThat(m.subject()).contains("Recibimos tu orden").contains(o.getReference());
    }

    @Test
    void webhookMarksPaid_sendsPaidEmailToCustomerAndAdmin() {
        Order o = seed();
        email.reset();

        String pid = gateway.recordPayment(o.getReference(), "approved",
            "credit_card", new BigDecimal("342000.00"));
        paymentService.applyPaymentUpdate(pid);

        assertThat(email.sent).hasSize(2);
        assertThat(email.sent).anyMatch(m ->
            m.to().equals("customer@example.com")
            && m.subject().contains("Pago confirmado"));
        assertThat(email.sent).anyMatch(m ->
            m.to().equals("admin@artesa.com")
            && m.subject().contains("Venta nueva"));
    }

    @Test
    void adminMarksShipped_sendsShippedEmail() {
        Order o = seed();
        email.reset();

        adminOrderService.updateStatus(o.getId(), OrderStatus.SHIPPED);

        assertThat(email.sent).hasSize(1);
        assertThat(email.sent.get(0).subject()).contains("en camino").contains(o.getReference());
    }

    @Test
    void adminMarksDelivered_sendsDeliveredEmail() {
        Order o = seed();
        email.reset();

        adminOrderService.updateStatus(o.getId(), OrderStatus.DELIVERED);

        assertThat(email.sent).hasSize(1);
        assertThat(email.sent.get(0).subject()).contains("llegó").contains(o.getReference());
    }

    @Test
    void adminMarksCancelled_sendsCancelledEmail() {
        Order o = seed();
        email.reset();

        adminOrderService.updateStatus(o.getId(), OrderStatus.CANCELLED);

        assertThat(email.sent).hasSize(1);
        assertThat(email.sent.get(0).subject()).contains("cancelada");
    }

    @Test
    void statusUnchanged_sendsNoEmail() {
        Order o = seed();
        email.reset();

        // Same status as current — should be a no-op.
        adminOrderService.updateStatus(o.getId(), OrderStatus.PENDING);
        assertThat(email.sent).isEmpty();
    }
}
