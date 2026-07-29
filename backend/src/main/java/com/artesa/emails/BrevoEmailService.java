package com.artesa.emails;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * Sends via Brevo (https://brevo.com, formerly Sendinblue) using their
 * transactional email REST API. Chosen when the shop needs to send from
 * Railway (or any host that blocks outbound SMTP): Brevo's API runs over
 * HTTPS on port 443, so it works anywhere HTTP does.
 *
 * Wired when `artesa.emails.provider=brevo`. Free tier is 300 emails/day
 * and Brevo accepts a verified single sender (no domain purchase needed)
 * — a good fit before the shop has its own domain.
 */
@Component
@ConditionalOnProperty(name = "artesa.emails.provider", havingValue = "brevo")
public class BrevoEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailService.class);
    private static final String ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final String apiKey;
    private final String senderName;
    private final String senderEmail;
    private final RestClient http;

    public BrevoEmailService(@Value("${artesa.emails.brevo.api-key:}") String apiKey,
                             @Value("${artesa.emails.from}") String from) {
        this.apiKey = apiKey;
        // `from` is stored in RFC-5322 form ("Display Name <addr@host>") because
        // Resend/Gmail SMTP accept it verbatim, but Brevo needs the name and
        // address as separate JSON fields. Split them here; fall back to the
        // raw string if it's just a bare address.
        int lt = from.indexOf('<');
        int gt = from.indexOf('>');
        if (lt > 0 && gt > lt) {
            this.senderName = from.substring(0, lt).trim();
            this.senderEmail = from.substring(lt + 1, gt).trim();
        } else {
            this.senderName = "";
            this.senderEmail = from.trim();
        }
        this.http = RestClient.create();

        log.info("BrevoEmailService configured: sender={} <{}> keyPresent={}",
                 senderName.isEmpty() ? "(unnamed)" : senderName,
                 senderEmail,
                 !apiKey.isBlank());
        if (apiKey.isBlank()) {
            log.warn("Brevo email provider selected but ARTESA_EMAILS_BREVO_API_KEY is empty — sends will be skipped.");
        }
    }

    @Override
    public void send(EmailMessage message) {
        if (apiKey.isBlank()) {
            log.warn("Skipping email to {} — no Brevo API key configured", message.to());
            return;
        }
        Map<String, Object> sender = senderName.isEmpty()
            ? Map.of("email", senderEmail)
            : Map.of("name", senderName, "email", senderEmail);

        var payload = Map.of(
            "sender",      sender,
            "to",          List.of(Map.of("email", message.to())),
            "subject",     message.subject(),
            "htmlContent", message.html()
        );
        try {
            http.post()
                .uri(ENDPOINT)
                .header("api-key", apiKey)
                .header("accept", "application/json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
            log.info("Email sent via Brevo: to={}, subject='{}'", message.to(), message.subject());
        } catch (RestClientResponseException e) {
            // Brevo returns JSON errors — log the body so operators can diagnose
            // "sender not verified" / "invalid api-key" without extra tooling.
            log.error("Brevo rejected email to {} (status {}): {}",
                message.to(), e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to send email via Brevo to {}", message.to(), e);
        }
    }
}
