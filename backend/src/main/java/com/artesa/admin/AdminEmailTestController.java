package com.artesa.admin;

import com.artesa.emails.EmailMessage;
import com.artesa.emails.EmailService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/test-email")
public class AdminEmailTestController {

    private final EmailService emailService;
    private final String defaultTo;
    private final String providerName;

    public AdminEmailTestController(
            EmailService emailService,
            @Value("${artesa.emails.admin-to}") String adminTo,
            @Value("${artesa.emails.provider:unknown}") String provider) {
        this.emailService = emailService;
        this.defaultTo = adminTo;
        this.providerName = provider;
    }

    public record TestEmailRequest(@Email String to) {}

    @PostMapping
    public Map<String, Object> send(@RequestBody(required = false) TestEmailRequest req) {
        String target = (req != null && req.to() != null && !req.to().isBlank())
                ? req.to().trim()
                : defaultTo;

        String subject = "FannyDeco — prueba de envío (" + providerName + ")";
        String html = """
                <div style="font-family:system-ui,Arial,sans-serif;padding:24px;max-width:600px">
                    <h2 style="color:#5C3A28">Test OK ✔</h2>
                    <p>Este es un mail de prueba disparado desde el panel de admin de FannyDeco.</p>
                    <p style="color:#666;font-size:12px;margin-top:24px">
                        Proveedor: <strong>%s</strong><br>
                        Enviado: %s
                    </p>
                </div>
                """.formatted(providerName, Instant.now());

        emailService.send(new EmailMessage(target, subject, html));

        return Map.of(
                "queued", true,
                "provider", providerName,
                "to", target,
                "at", Instant.now().toString()
        );
    }
}
