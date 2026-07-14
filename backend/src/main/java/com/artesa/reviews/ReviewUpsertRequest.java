package com.artesa.reviews;

import jakarta.validation.constraints.*;

public record ReviewUpsertRequest(
    @NotBlank @Size(max = 120)
    String authorName,

    @NotNull @Min(1) @Max(5)
    Integer rating,

    @NotBlank @Size(max = 2000)
    String body,

    @Size(max = 120)
    String location,

    @Size(max = 200)
    String productName
) {}
