package com.artesa.orders.admin;

import com.artesa.emails.OrderMailer;
import com.artesa.orders.Order;
import com.artesa.orders.OrderNotFoundException;
import com.artesa.orders.OrderRepository;
import com.artesa.orders.OrderStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AdminOrderService {

    private final OrderRepository orderRepo;
    private final OrderMailer mailer;

    public AdminOrderService(OrderRepository orderRepo, OrderMailer mailer) {
        this.orderRepo = orderRepo;
        this.mailer = mailer;
    }

    @Transactional(readOnly = true)
    public Page<Order> search(OrderStatus status, String q, Pageable pageable) {
        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (status != null) {
                preds.add(cb.equal(root.get("status"), status));
            }
            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase() + "%";
                preds.add(cb.or(
                    cb.like(cb.lower(root.get("reference")), like),
                    cb.like(cb.lower(root.get("customerEmail")), like),
                    cb.like(cb.lower(root.get("customerName")), like)
                ));
            }
            return preds.isEmpty() ? cb.conjunction() : cb.and(preds.toArray(new Predicate[0]));
        };
        return orderRepo.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public Order getById(Long id) {
        return orderRepo.findById(id)
            .orElseThrow(() -> new OrderNotFoundException("id=" + id));
    }

    public Order updateStatus(Long id, OrderStatus newStatus) {
        Order order = getById(id);
        OrderStatus previous = order.getStatus();
        setField(order, "status", newStatus);
        Order saved = orderRepo.save(order);
        mailer.onStatusTransition(saved, previous, newStatus);
        return saved;
    }

    /**
     * Admin can set/edit the shipping tracking info at any time. It's included in
     * the next "shipped" email — so if the admin sets it BEFORE marking SHIPPED,
     * the customer's first shipping email already carries the code.
     */
    public Order updateTracking(Long id, String trackingInfo) {
        Order order = getById(id);
        String normalized = (trackingInfo == null || trackingInfo.isBlank())
            ? null : trackingInfo.trim();
        setField(order, "trackingInfo", normalized);
        return orderRepo.save(order);
    }

    private static void setField(Object target, String fieldName, Object value) {
        Field f = ReflectionUtils.findField(target.getClass(), fieldName);
        if (f == null) throw new IllegalStateException("Missing field " + fieldName);
        ReflectionUtils.makeAccessible(f);
        ReflectionUtils.setField(f, target, value);
    }
}
