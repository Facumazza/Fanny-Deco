package com.artesa.orders.dto;

import com.artesa.orders.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderDto(
    Long id,
    String reference,
    String customerEmail,
    String customerName,
    String shippingAddress,
    String city,
    String postalCode,
    String country,
    String phone,
    String notes,
    BigDecimal subtotalArs,
    OrderStatus status,
    String trackingInfo,
    Instant createdAt,
    List<Item> items
) {
    public record Item(
        Long id,
        Long productId,
        String productSlug,
        String productName,
        String productImageUrl,
        String color,
        int quantity,
        BigDecimal unitPriceArs,
        BigDecimal lineTotalArs
    ) {}
}
