package com.artesa.catalog.admin.dto;

public record AdminCategoryDto(
    Long id,
    String slug,
    String name,
    String subtitle,
    String imageUrl,
    int displayOrder,
    long productCount
) {}
