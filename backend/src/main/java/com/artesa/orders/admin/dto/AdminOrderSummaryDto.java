package com.artesa.orders.admin.dto;

import com.artesa.orders.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Compact row shape for the admin orders list — no items, just enough to render a table.
 */
public record AdminOrderSummaryDto(
    Long id,
    String reference,
    String customerEmail,
    String customerName,
    BigDecimal subtotalArs,
    OrderStatus status,
    int itemCount,
    Instant createdAt
) {}
