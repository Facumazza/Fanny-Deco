package com.artesa.emails;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Siempre tiene que haber un EmailService. Cuando la selección dependía de
 * @ConditionalOnProperty, un ARTESA_EMAILS_PROVIDER con un valor sin
 * implementación dejaba el contexto sin el bean y la app no arrancaba:
 * el deploy moría en el healthcheck y Railway volvía al build anterior.
 */
class EmailConfigTest {

    private final EmailConfig config = new EmailConfig();

    @Test
    void consoleProviderGivesTheConsoleImplementation() {
        assertThat(config.emailService("console")).isInstanceOf(ConsoleEmailService.class);
    }

    @Test
    void unknownProviderStillGivesAnImplementation() {
        // El caso que rompió producción: la app tiene que levantar igual.
        for (String provider : new String[] { "resend", "brevo", "", "  ", "CONSOLE " }) {
            assertThat(config.emailService(provider))
                .as("provider=%s", provider)
                .isNotNull();
        }
    }
}
