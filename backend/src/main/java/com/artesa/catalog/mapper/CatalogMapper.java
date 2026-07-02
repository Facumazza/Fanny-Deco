package com.artesa.catalog.mapper;

import com.artesa.catalog.domain.*;
import com.artesa.catalog.web.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Function;

@Component
public class CatalogMapper {

    public CategoryDto toDto(Category c) {
        return new CategoryDto(c.getId(), c.getSlug(), c.getName(),
                               c.getSubtitle(), c.getImageUrl());
    }

    public ProductSummaryDto toSummary(Product p) {
        return new ProductSummaryDto(
            p.getId(), p.getSlug(), p.getName(), p.getPriceUsd(), p.getImageUrl(),
            p.getBadge(), p.getRatingAvg(), p.getRatingCount(),
            p.getCategory().getSlug(),
            p.getColors().stream().map(ProductColor::getHex).toList()
        );
    }

    public ProductDetailDto toDetail(Product p) {
        return new ProductDetailDto(
            p.getId(), p.getSlug(), p.getName(), p.getPriceUsd(), p.getImageUrl(),
            p.getBadge(), p.getRatingAvg(), p.getRatingCount(),
            p.getCategory().getSlug(), p.getCategory().getName(),
            p.getDescription(),
            p.getColors().stream().map(ProductColor::getHex).toList()
        );
    }

    public ReviewDto toDto(Review r) {
        return new ReviewDto(r.getId(), r.getAuthorName(), r.getRating(),
                             r.getBody(), r.getCreatedAt());
    }

    public <E, D> PageDto<D> toPage(Page<E> src, Function<E, D> mapper) {
        List<D> content = src.getContent().stream().map(mapper).toList();
        return new PageDto<>(content, src.getNumber(), src.getSize(),
                             src.getTotalElements(), src.getTotalPages());
    }
}
