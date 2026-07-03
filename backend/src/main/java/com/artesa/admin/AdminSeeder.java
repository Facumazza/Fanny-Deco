package com.artesa.admin;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final AdminUserRepository repo;
    private final PasswordEncoder encoder;

    @Value("${artesa.admin.email:admin@artesa.com}")
    private String adminEmail;

    @Value("${artesa.admin.password:changeme123}")
    private String adminPassword;

    public AdminSeeder(AdminUserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repo.count() == 0) {
            AdminUser admin = new AdminUser(adminEmail, encoder.encode(adminPassword));
            repo.save(admin);
            log.warn("");
            log.warn("=====================================================");
            log.warn("  Admin user created: {}", adminEmail);
            log.warn("  Default password: {}", adminPassword);
            log.warn("  CHANGE THIS in application.yml before deploying.");
            log.warn("=====================================================");
            log.warn("");
        }
    }
}
