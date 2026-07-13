package com.artesa.emails;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.util.ArrayList;
import java.util.List;

/**
 * Test-only EmailService that collects sent messages in-memory so ITs can assert
 * on them. Wire it in with @Import(FakeEmailService.Config.class) and
 * @TestPropertySource(properties = "artesa.emails.provider=fake").
 */
public class FakeEmailService implements EmailService {

    public final List<EmailMessage> sent = new ArrayList<>();

    @Override
    public void send(EmailMessage message) {
        sent.add(message);
    }

    public void reset() {
        sent.clear();
    }

    @TestConfiguration
    @ConditionalOnProperty(name = "artesa.emails.provider",
                           havingValue = "fake", matchIfMissing = false)
    public static class Config {
        @Bean
        @Primary
        public FakeEmailService fakeEmailService() {
            return new FakeEmailService();
        }
    }
}
