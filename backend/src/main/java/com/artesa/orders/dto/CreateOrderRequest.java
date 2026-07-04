package com.artesa.orders.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record CreateOrderRequest(
    @Email @NotBlank @Size(max = 180) String customerEmail,
    @NotBlank @Size(max = 200) String customerName,
    @NotBlank @Size(max = 500) String shippingAddress,
    @NotBlank @Size(max = 120) String city,
    @Size(max = 20) String postalCode,
    @NotBlank @Size(max = 120) String country,
    @Size(max = 60) String phone,
    @Size(max = 500) String notes,
    @NotEmpty @Size(max = 100) @Valid List<Item> items
) {
    public record Item(
        @NotNull Long productId,
        @Min(1) @Max(99) int quantity,
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$")
        String color
    ) {}
}
