package com.artesa.orders.admin.dto;

import jakarta.validation.constraints.Size;

public record UpdateTrackingRequest(
    @Size(max = 300)
    String trackingInfo   // nullable — blank/null clears it
) {}
