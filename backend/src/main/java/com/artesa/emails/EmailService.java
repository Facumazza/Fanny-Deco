package com.artesa.emails;

/**
 * Provider-agnostic mailer. Three implementations wired conditionally:
 *   - ResendEmailService (posts to Resend's REST API — needs a verified domain)
 *   - GmailEmailService  (SMTP to smtp.gmail.com with a Google App Password)
 *   - ConsoleEmailService (dev/tests; logs the email to stdout without sending)
 * The bean picked is controlled by `artesa.emails.provider` (resend|gmail|console).
 */
public interface EmailService {
    /** Best-effort. Never throws; failures are logged so a mailer outage doesn't break checkout. */
    void send(EmailMessage message);
}
