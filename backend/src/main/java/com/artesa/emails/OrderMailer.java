package com.artesa.emails;

import com.artesa.orders.Order;
import com.artesa.orders.OrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Thin bridge between the order lifecycle and EmailService. Order/Payment services
 * call the transition methods here (e.g. `onOrderPaid(order)`) and this class
 * decides which templates to fire.
 *
 * Kept as a separate service (instead of hand-rolling calls at each callsite) so
 * we have exactly one place to add a new email transition, and so the "email
 * side effect" is easy to grep for.
 */
@Component
public class OrderMailer {

    private static final Logger log = LoggerFactory.getLogger(OrderMailer.class);

    private final EmailService email;
    private final OrderEmailTemplates templates;
    private final String adminEmail;

    public OrderMailer(EmailService email,
                       OrderEmailTemplates templates,
                       @Value("${artesa.emails.admin-to}") String adminEmail) {
        this.email = email;
        this.templates = templates;
        this.adminEmail = adminEmail;
    }

    /** Order was just created; payment is still pending. */
    public void onOrderCreated(Order order) {
        safeSend(templates.orderReceived(order));
    }

    /** Payment approved — either by MP webhook or manual admin toggle. Notifies both parties. */
    public void onOrderPaid(Order order) {
        safeSend(templates.orderPaid(order));
        safeSend(templates.adminOrderPaid(adminEmail, order));
    }

    public void onOrderShipped(Order order) {
        safeSend(templates.orderShipped(order));
    }

    public void onOrderDelivered(Order order) {
        safeSend(templates.orderDelivered(order));
    }

    public void onOrderCancelled(Order order) {
        safeSend(templates.orderCancelled(order));
    }

    public void onOrderRefunded(Order order) {
        safeSend(templates.orderRefunded(order));
    }

    /**
     * Dispatch based on a status transition. Called by AdminOrderService when the
     * admin flips the status manually. `from` may be null on the very first assignment.
     */
    public void onStatusTransition(Order order, OrderStatus from, OrderStatus to) {
        if (to == null || to == from) return;
        switch (to) {
            case PAID      -> onOrderPaid(order);
            case SHIPPED   -> onOrderShipped(order);
            case DELIVERED -> onOrderDelivered(order);
            case CANCELLED -> onOrderCancelled(order);
            case REFUNDED  -> onOrderRefunded(order);
            case PENDING   -> { /* no-op — going back to pending doesn't warrant an email */ }
        }
    }

    private void safeSend(EmailMessage m) {
        try {
            email.send(m);
        } catch (Exception e) {
            // Never let a mailer failure poison a business transaction.
            log.error("Email send failed (to={}): {}", m.to(), e.getMessage(), e);
        }
    }
}
