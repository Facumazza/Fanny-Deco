package com.artesa.emails;

/**
 * Provider-agnostic mailer. Two implementations wired conditionally:
 *   - ResendEmailService (production; posts to Resend's API)
 *   - ConsoleEmailService (dev/tests; logs the email to stdout without sending)
 * The bean picked is controlled by `artesa.emails.provider` (resend|console).
 */
public interface EmailService {
    /** Best-effort. Never throws; failures are logged so a mailer outage doesn't break checkout. */
    void send(EmailMessage message);
}
