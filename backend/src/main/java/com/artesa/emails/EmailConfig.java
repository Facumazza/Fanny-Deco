package com.artesa.emails;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Elige la implementación de {@link EmailService} según
 * `artesa.emails.provider`.
 *
 * Antes la selección eran @ConditionalOnProperty sueltos sobre cada
 * implementación, y eso tenía un filo: alcanzaba con que la variable
 * ARTESA_EMAILS_PROVIDER tuviera un valor sin implementación (o vacío) para
 * que no quedara ningún bean de EmailService y la app **no arrancara**. Pasó
 * en producción: el deploy crasheaba al bootear, el healthcheck fallaba y
 * Railway volvía al build anterior, así que la tienda quedó semanas sirviendo
 * una versión vieja sin que nada lo gritara.
 *
 * Ahora siempre hay un bean. Un provider desconocido cae en la consola y deja
 * un ERROR bien visible en el log de arranque, pero la tienda levanta: no
 * poder mandar mails es un problema mucho menor que estar caído.
 */
@Configuration
public class EmailConfig {

    private static final Logger log = LoggerFactory.getLogger(EmailConfig.class);

    static final String CONSOLE = "console";

    @Bean
    public EmailService emailService(
            @Value("${artesa.emails.provider:" + CONSOLE + "}") String provider) {

        if (!CONSOLE.equalsIgnoreCase(provider.trim())) {
            log.error("artesa.emails.provider='{}' no tiene implementación; se usa la de "
                    + "consola y los mails NO se envían. Valores válidos hoy: '{}'.",
                    provider, CONSOLE);
        }
        return new ConsoleEmailService();
    }
}
