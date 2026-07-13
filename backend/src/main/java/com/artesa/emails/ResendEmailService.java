package com.artesa.emails;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

/**
 * Sends via Resend (https://resend.com) using their simple REST API. No SDK
 * dependency — a single POST does it. Wired only when
 * `artesa.emails.provider=resend` AND `RESEND_API_KEY` is non-empty at startup.
 */
@Component
@ConditionalOnProperty(name = "artesa.emails.provider", havingValue = "resend")
public class ResendEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(ResendEmailService.class);
    private static final String ENDPOINT = "https://api.resend.com/emails";

    private final String apiKey;
    private final String from;
    private final RestClient http;

    public ResendEmailService(@Value("${artesa.emails.resend.api-key:}") String apiKey,
                              @Value("${artesa.emails.from}") String from) {
        this.apiKey = apiKey;
        this.from = from;
        this.http = RestClient.create();
        if (apiKey.isBlank()) {
            log.warn("Resend email provider selected but RESEND_API_KEY is empty — sends will fail.");
        }
    }

    @Override
    public void send(EmailMessage message) {
        if (apiKey.isBlank()) {
            log.warn("Skipping email to {} — no Resend API key configured", message.to());
            return;
        }
        var payload = Map.of(
            "from", from,
            "to", message.to(),
            "subject", message.subject(),
            "html", message.html()
        );
        try {
            http.post()
                .uri(ENDPOINT)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
            log.info("Email sent via Resend: to={}, subject='{}'", message.to(), message.subject());
        } catch (RestClientResponseException e) {
            log.error("Resend rejected email to {} (status {}): {}",
                message.to(), e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to send email via Resend to {}", message.to(), e);
        }
    }
}
