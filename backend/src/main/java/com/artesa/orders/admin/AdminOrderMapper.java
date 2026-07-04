package com.artesa.orders.admin;

import com.artesa.orders.Order;
import com.artesa.orders.admin.dto.AdminOrderSummaryDto;
import org.springframework.stereotype.Component;

@Component
public class AdminOrderMapper {

    public AdminOrderSummaryDto toSummary(Order o) {
        return new AdminOrderSummaryDto(
            o.getId(),
            o.getReference(),
            o.getCustomerEmail(),
            o.getCustomerName(),
            o.getSubtotalUsd(),
            o.getStatus(),
            o.getItems().size(),
            o.getCreatedAt()
        );
    }
}
