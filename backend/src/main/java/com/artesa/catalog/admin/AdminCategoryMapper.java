package com.artesa.catalog.admin;

import com.artesa.catalog.admin.dto.AdminCategoryDto;
import com.artesa.catalog.domain.Category;
import org.springframework.stereotype.Component;

@Component
public class AdminCategoryMapper {

    public AdminCategoryDto toDto(Category c, long productCount) {
        return new AdminCategoryDto(
            c.getId(),
            c.getSlug(),
            c.getName(),
            c.getSubtitle(),
            c.getImageUrl(),
            c.getDisplayOrder(),
            productCount
        );
    }
}
