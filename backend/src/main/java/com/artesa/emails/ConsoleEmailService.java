package com.artesa.emails;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Dev fallback. Instead of contacting a real mail provider, prints the email
 * payload to the log — useful before Resend credentials are set up. Never fails.
 */
@Component
@ConditionalOnProperty(name = "artesa.emails.provider",
                       havingValue = "console", matchIfMissing = true)
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
