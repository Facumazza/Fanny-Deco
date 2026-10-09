package com.artesa.orders;

import com.artesa.orders.dto.OrderDto;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderDto toDto(Order o) {
        return new OrderDto(
            o.getId(),
            o.getReference(),
            o.getCustomerEmail(),
            o.getCustomerName(),
            o.getShippingAddress(),
            o.getCity(),
            o.getPostalCode(),
            o.getCountry(),
            o.getPhone(),
            o.getNotes(),
            o.getSubtotalArs(),
            o.getStatus(),
            o.getTrackingInfo(),
            o.getReceiptUrl(),
            o.getCreatedAt(),
            o.getItems().stream()
                .map(this::toItem)
                .toList()
        );
    }

    private OrderDto.Item toItem(OrderItem i) {
        // product puede ser null cuando el admin borro el producto despues
        // de la venta (V15 convirtio el FK a ON DELETE SET NULL). El resto
        // del item se arma con los campos snapshot de order_items.
        Long productId = i.getProduct() != null ? i.getProduct().getId() : null;
        return new OrderDto.Item(
            i.getId(),
            productId,
            i.getProductSlug(),
            i.getProductName(),
            i.getProductImageUrl(),
            i.getColor(),
            i.getQuantity(),
            i.getUnitPriceArs(),
            i.getLineTotalArs()
        );
    }
}
