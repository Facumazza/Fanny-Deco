package com.artesa.emails;

/**
 * Provider-agnostic mailer. Only ConsoleEmailService is wired today because
 * customer notifications go out via the WhatsApp handoff in the admin panel
 * (Railway blocks outbound SMTP and there's no verified sending domain yet).
 * The interface is kept so that when a domain is ready, a Resend or Brevo
 * implementation can be dropped in without touching OrderMailer or the
 * templates. Selection is controlled by `artesa.emails.provider` — today the
 * only meaningful value is `console`.
 */
public interface EmailService {
    /** Best-effort. Never throws; failures are logged so a mailer outage doesn't break checkout. */
    void send(EmailMessage message);
}
