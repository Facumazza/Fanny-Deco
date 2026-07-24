package com.artesa.common.ratelimit;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Wires per-endpoint rate limiters. Limits are conservative enough not to
 * bother a legitimate user (nobody logs in 11 times a minute; nobody
 * checks out 11 carts a minute) but tight enough to make brute-forcing
 * the admin password or spamming orders costly.
 */
@Configuration
public class RateLimitConfig implements WebMvcConfigurer {

    private final InMemoryRateLimiter limiter;

    public RateLimitConfig(InMemoryRateLimiter limiter) {
        this.limiter = limiter;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Admin login: 10 attempts per minute per IP.
        registry.addInterceptor(new RateLimitInterceptor(limiter, 10, 60_000L))
            .addPathPatterns("/api/admin/auth/login");

        // Order creation: 10 orders per minute per IP.
        registry.addInterceptor(new RateLimitInterceptor(limiter, 10, 60_000L))
            .addPathPatterns("/api/orders");

        // Receipt upload: 5 per minute per IP. Public endpoint that writes to
        // storage, so more strict — a legit customer uploads once, maybe twice
        // if they picked the wrong file.
        registry.addInterceptor(new RateLimitInterceptor(limiter, 5, 60_000L))
            .addPathPatterns("/api/orders/*/receipt");
    }
}
