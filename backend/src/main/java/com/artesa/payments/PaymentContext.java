package com.artesa.payments;

/**
 * Runtime info needed to build the preference — mostly URLs the provider will
 * bounce back to. Passed in so the same gateway can serve dev (ngrok) and prod.
 */
public record PaymentContext(
    String successUrl,
    String failureUrl,
    String pendingUrl,
    String webhookUrl
) {}
