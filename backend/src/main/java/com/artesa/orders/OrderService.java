package com.artesa.orders;

import com.artesa.catalog.domain.Product;
import com.artesa.catalog.repository.ProductRepository;
import com.artesa.catalog.service.ProductNotFoundException;
import com.artesa.orders.dto.CreateOrderRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    /** Alphabet excludes 0, O, 1, I, L to avoid confusion when reading references. */
    private static final char[] REF_ALPHABET =
        "ABCDEFGHJKMNPQRSTUVWXYZ23456789".toCharArray();
    private static final int REF_LENGTH = 6;
    private static final SecureRandom RNG = new SecureRandom();

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;

    public OrderService(OrderRepository orderRepo, ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }

    @Transactional(readOnly = true)
    public Order getByReference(String reference) {
        return orderRepo.findByReference(reference)
            .orElseThrow(() -> new OrderNotFoundException(reference));
    }

    public Order create(CreateOrderRequest req) {
        // Load all requested products in one shot and index by id for O(1) lookup.
        List<Long> productIds = req.items().stream()
            .map(CreateOrderRequest.Item::productId)
            .distinct()
            .toList();
        Map<Long, Product> productsById = productRepo.findAllById(productIds).stream()
            .collect(Collectors.toMap(Product::getId, Function.identity()));

        // Fail fast if any referenced product does not exist.
        for (CreateOrderRequest.Item ri : req.items()) {
            if (!productsById.containsKey(ri.productId())) {
                throw new ProductNotFoundException("id=" + ri.productId());
            }
        }

        Order order = new Order();
        setField(order, "reference", generateUniqueReference());
        setField(order, "customerEmail", req.customerEmail().trim().toLowerCase());
        setField(order, "customerName", req.customerName().trim());
        setField(order, "shippingAddress", req.shippingAddress().trim());
        setField(order, "city", req.city().trim());
        setField(order, "postalCode", nullIfBlank(req.postalCode()));
        setField(order, "country", req.country().trim());
        setField(order, "phone", nullIfBlank(req.phone()));
        setField(order, "notes", nullIfBlank(req.notes()));
        setField(order, "status", OrderStatus.PENDING);
        setField(order, "createdAt", Instant.now());

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CreateOrderRequest.Item ri : req.items()) {
            Product p = productsById.get(ri.productId());
            BigDecimal unit = p.getPriceArs();
            BigDecimal line = unit.multiply(BigDecimal.valueOf(ri.quantity()));

            OrderItem oi = new OrderItem();
            setField(oi, "order", order);
            setField(oi, "product", p);
            setField(oi, "productSlug", p.getSlug());
            setField(oi, "productName", p.getName());
            setField(oi, "productImageUrl", p.getImageUrl());
            setField(oi, "color", ri.color());
            setField(oi, "quantity", ri.quantity());
            setField(oi, "unitPriceArs", unit);
            setField(oi, "lineTotalArs", line);
            order.getItems().add(oi);

            subtotal = subtotal.add(line);
        }
        setField(order, "subtotalArs", subtotal);

        return orderRepo.save(order);
    }

    private String generateUniqueReference() {
        // Very small collision surface (6 chars from 31-symbol alphabet ~= 900M combos)
        // but we still recheck to be safe.
        for (int i = 0; i < 5; i++) {
            String candidate = "ARTESA-" + randomToken();
            if (!orderRepo.existsByReference(candidate)) return candidate;
        }
        throw new IllegalStateException("Could not generate a unique order reference");
    }

    private String randomToken() {
        StringBuilder sb = new StringBuilder(REF_LENGTH);
        for (int i = 0; i < REF_LENGTH; i++) {
            sb.append(REF_ALPHABET[RNG.nextInt(REF_ALPHABET.length)]);
        }
        return sb.toString();
    }

    private static String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static void setField(Object target, String name, Object value) {
        Field f = ReflectionUtils.findField(target.getClass(), name);
        if (f == null) throw new IllegalStateException("Missing field " + name);
        ReflectionUtils.makeAccessible(f);
        ReflectionUtils.setField(f, target, value);
    }
}
