package com.artesa.catalog.web.dto;

public record CategoryDto(
    Long id, String slug, String name, String subtitle, String imageUrl
) {}
