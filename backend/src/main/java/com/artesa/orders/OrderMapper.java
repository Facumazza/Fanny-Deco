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
            o.getCreatedAt(),
            o.getItems().stream()
                .map(this::toItem)
                .toList()
        );
    }

    private OrderDto.Item toItem(OrderItem i) {
        return new OrderDto.Item(
            i.getId(),
            i.getProduct().getId(),
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
