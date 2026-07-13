package com.artesa.emails;

/**
 * Provider-agnostic email payload. `html` is treated as trusted HTML — the caller
 * is responsible for escaping user-supplied fragments.
 */
public record EmailMessage(
    String to,
    String subject,
    String html
) {}
