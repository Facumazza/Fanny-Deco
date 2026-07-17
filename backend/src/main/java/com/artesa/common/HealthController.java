package com.artesa.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Liveness probe for the platform (Railway, load balancer, uptime monitor).
 * Public — must return 200 without depending on Spring Security context or
 * any external service (DB, MercadoPago) so we can tell 'app process is up'
 * apart from 'external service is degraded'. If you need a deeper readiness
 * check, add spring-boot-starter-actuator later.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
