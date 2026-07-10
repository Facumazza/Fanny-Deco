package com.artesa.payments;

import com.artesa.orders.Order;
import com.artesa.orders.OrderRepository;
import com.artesa.orders.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.time.Instant;

@Service
@Transactional
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentGateway gateway;
    private final OrderRepository orderRepo;
    private final String publicBaseUrl;
    private final String frontendBaseUrl;

    public PaymentService(PaymentGateway gateway,
                          OrderRepository orderRepo,
                          @Value("${artesa.payments.public-base-url}") String publicBaseUrl,
                          @Value("${artesa.payments.frontend-base-url}") String frontendBaseUrl) {
        this.gateway = gateway;
        this.orderRepo = orderRepo;
        this.publicBaseUrl = trimSlash(publicBaseUrl);
        this.frontendBaseUrl = trimSlash(frontendBaseUrl);
    }

    /**
     * Creates a MercadoPago preference for the given order and stores the preference id.
     * Idempotent per order: if a preference already exists we just return the same one
     * (avoids charging duplicate fees if the user reloads /checkout).
     */
    public PaymentInitiation initiatePaymentFor(Order order) {
        PaymentContext ctx = new PaymentContext(
            frontendBaseUrl + "/orden/" + order.getReference() + "/success",
            frontendBaseUrl + "/orden/" + order.getReference() + "/fallo",
            frontendBaseUrl + "/orden/" + order.getReference() + "/pendiente",
            publicBaseUrl + "/api/webhooks/mercadopago"
        );

        PaymentInitiation init = gateway.createInitiation(order, ctx);
        setField(order, "preferenceId", init.preferenceId());
        orderRepo.save(order);
        return init;
    }

    /**
     * Called by the webhook. Fetches the payment from the provider and, if it maps
     * to a known order (via external_reference == our order reference), updates the
     * order status accordingly. Idempotent.
     */
    public void applyPaymentUpdate(String paymentId) {
        PaymentStatusInfo info = gateway.fetchPaymentStatus(paymentId);
        if (info.externalReference() == null) {
            log.warn("Payment {} has no external_reference; ignoring", paymentId);
            return;
        }
        var maybe = orderRepo.findByReference(info.externalReference());
        if (maybe.isEmpty()) {
            log.warn("Payment {} references unknown order {}", paymentId, info.externalReference());
            return;
        }
        Order order = maybe.get();
        setField(order, "paymentId", info.paymentId());
        setField(order, "paymentStatus", info.status());
        setField(order, "paymentMethod", info.paymentMethod());
        setField(order, "status", mapProviderStatusToOrder(info.status()));
        if ("approved".equalsIgnoreCase(info.status()) && order.getPaidAt() == null) {
            setField(order, "paidAt", Instant.now());
        }
        orderRepo.save(order);
    }

    private static OrderStatus mapProviderStatusToOrder(String providerStatus) {
        if (providerStatus == null) return OrderStatus.PENDING;
        return switch (providerStatus.toLowerCase()) {
            case "approved", "authorized"           -> OrderStatus.PAID;
            case "rejected", "cancelled", "refunded" -> OrderStatus.CANCELLED;
            default -> OrderStatus.PENDING;   // pending, in_process, in_mediation
        };
    }

    private static String trimSlash(String s) {
        return s == null ? "" : (s.endsWith("/") ? s.substring(0, s.length() - 1) : s);
    }

    private static void setField(Object target, String name, Object value) {
        Field f = ReflectionUtils.findField(target.getClass(), name);
        if (f == null) throw new IllegalStateException("Missing field " + name);
        ReflectionUtils.makeAccessible(f);
        ReflectionUtils.setField(f, target, value);
    }
}
