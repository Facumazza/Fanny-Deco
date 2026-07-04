package com.artesa.orders.admin.dto;

import com.artesa.orders.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
    @NotNull OrderStatus status
) {}
