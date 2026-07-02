package com.artesa.catalog.web.dto;

import java.time.Instant;

public record ReviewDto(
    Long id,
    String authorName,
    int rating,
    String body,
    String location,
    String productName,
    Instant createdAt
) {}
