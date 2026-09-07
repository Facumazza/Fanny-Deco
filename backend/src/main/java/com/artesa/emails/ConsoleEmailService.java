package com.artesa.emails;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementación por defecto: en vez de hablar con un proveedor real, escribe
 * el mail en el log. Es la única que existe hoy — las notificaciones al
 * cliente salen por el handoff de WhatsApp del panel de admin. Nunca falla.
 *
 * La instancia la crea {@link EmailConfig}, no el component scan: quién se
 * usa depende de `artesa.emails.provider` y esa decisión vive en un solo
 * lugar.
 */
public class ConsoleEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger("EMAIL");

    @Override
    public void send(EmailMessage message) {
        log.info("");
        log.info("========== [dev-only] Email would have been sent ==========");
        log.info("  To:      {}", message.to());
        log.info("  Subject: {}", message.subject());
        log.info("  Body (first 500 chars):\n{}",
            message.html().length() > 500 ? message.html().substring(0, 500) + "…" : message.html());
        log.info("=============================================================");
        log.info("");
    }
}
