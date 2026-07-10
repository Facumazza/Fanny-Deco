package com.artesa.payments;

public record PaymentInitiation(
    String preferenceId,
    String initPoint  // URL to redirect the customer to
) {}
