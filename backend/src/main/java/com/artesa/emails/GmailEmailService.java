package com.artesa.emails;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Properties;

/**
 * Sends transactional emails through Gmail's SMTP relay using an 'App
 * Password' generated from the sender's Google account (requires 2FA to be
 * enabled). Wired only when `artesa.emails.provider=gmail`.
 *
 * Chosen over Resend when the shop doesn't have a verified sending domain
 * yet — Gmail SMTP lets you send from a real gmail.com address without any
 * DNS setup, at the cost of a ~500 mails/day quota (way more than a small
 * shop needs) and the sender field being locked to the authenticated
 * account (so ARTESA_EMAIL_FROM should use the same address as
 * ARTESA_EMAIL_GMAIL_USERNAME, otherwise Gmail silently rewrites it).
 *
 * The JavaMailSender is constructed manually here instead of letting Spring
 * auto-configure one from spring.mail.* properties. That keeps all Gmail
 * config self-contained in this file and avoids leaking a JavaMailSender
 * bean when a different email provider is active.
 */
@Component
@ConditionalOnProperty(name = "artesa.emails.provider", havingValue = "gmail")
public class GmailEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(GmailEmailService.class);

    private final JavaMailSenderImpl mailSender;
    private final String from;
    private final boolean configured;

    public GmailEmailService(
        @Value("${artesa.emails.gmail.username:}") String username,
        @Value("${artesa.emails.gmail.app-password:}") String appPassword,
        @Value("${artesa.emails.from}") String from
    ) {
        this.from = from;
        this.configured = !username.isBlank() && !appPassword.isBlank();

        this.mailSender = new JavaMailSenderImpl();
        this.mailSender.setHost("smtp.gmail.com");
        this.mailSender.setPort(587);
        this.mailSender.setUsername(username);
        // Google shows app passwords as 4 groups of 4 chars for readability
        // ('abcd efgh ijkl mnop'). The SMTP AUTH LOGIN command works with or
        // without the spaces but stripping them here means the operator can
        // paste the value exactly as Google displayed it and it just works.
        this.mailSender.setPassword(appPassword.replaceAll("\\s+", ""));

        Properties props = this.mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        // Fail fast if smtp.gmail.com is unreachable — a hung SMTP handshake
        // would otherwise block the request thread the mailer is called on
        // (order-created, status-change) for the full Java default of
        // Integer.MAX_VALUE milliseconds.
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        if (!configured) {
            log.warn("Gmail email provider selected but ARTESA_EMAIL_GMAIL_USERNAME " +
                "and/or ARTESA_EMAIL_GMAIL_APP_PASSWORD are empty — sends will be skipped.");
        }
    }

    @Override
    public void send(EmailMessage message) {
        if (!configured) {
            log.warn("Skipping email to {} — Gmail credentials not configured", message.to());
            return;
        }
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, StandardCharsets.UTF_8.name());
            helper.setFrom(from);
            helper.setTo(message.to());
            helper.setSubject(message.subject());
            helper.setText(message.html(), true);  // isHtml=true so the templates render, not appear as source
            mailSender.send(mime);
            log.info("Email sent via Gmail SMTP: to={}, subject='{}'", message.to(), message.subject());
        } catch (Exception e) {
            // Same swallow-and-log semantics as ResendEmailService — a mailer
            // outage must never fail the checkout or the admin status flip.
            log.error("Failed to send email via Gmail SMTP to {}", message.to(), e);
        }
    }
}
