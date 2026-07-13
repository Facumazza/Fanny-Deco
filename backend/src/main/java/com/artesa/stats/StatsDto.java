package com.artesa.stats;

import com.artesa.orders.OrderStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Compact snapshot for the admin dashboard. All monetary values in ARS integers.
 * Revenue counts only orders in a "money in" status (PAID, SHIPPED, DELIVERED).
 */
public record StatsDto(
    Bucket today,
    Bucket last7Days,
    Bucket thisMonth,
    Map<OrderStatus, Long> orderCountsByStatus,
    List<TopProduct> topProducts
) {
    public record Bucket(BigDecimal revenueArs, long orderCount) {}

    public record TopProduct(
        Long productId,
        String slug,
        String name,
        long unitsSold,
        BigDecimal revenueArs
    ) {}
}
