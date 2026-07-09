package com.artesa.catalog.admin;

import com.artesa.catalog.admin.dto.AdminProductDto;
import com.artesa.catalog.domain.Product;
import com.artesa.catalog.domain.ProductColor;
import org.springframework.stereotype.Component;

@Component
public class AdminProductMapper {

    public AdminProductDto toDto(Product p) {
        return new AdminProductDto(
            p.getId(),
            p.getSlug(),
            p.getName(),
            p.getDescription(),
            p.getPriceArs(),
            p.getImageUrl(),
            p.getBadge(),
            p.getRatingAvg(),
            p.getRatingCount(),
            p.getCategory().getId(),
            p.getCategory().getName(),
            p.getColors().stream().map(ProductColor::getHex).toList(),
            p.getCreatedAt()
        );
    }
}
