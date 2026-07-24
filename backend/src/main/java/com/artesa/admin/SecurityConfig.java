package com.artesa.admin;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AdminUserDetailsService uds,
                                                       PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(uds);
        provider.setPasswordEncoder(encoder);
        return new org.springframework.security.authentication.ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Stateless-ish setup: we use HTTP sessions ONLY when a user logs in.
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            // Disable CSRF because we authenticate via session cookie AND accept JSON from
            // the same-origin SPA (Vite proxy in dev, same host in prod).
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Public catalog routes.
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                // Auth endpoints: login is public; logout/me require auth.
                .requestMatchers(HttpMethod.POST, "/api/admin/auth/login").permitAll()
                // Everything under /api/admin/** requires ADMIN role.
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Public storefront endpoints for orders + payments.
                .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/orders/*/payment").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/orders/*/receipt").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/orders/*").permitAll()
                // Webhook must be public — MP has no session with us.
                .requestMatchers("/api/webhooks/**").permitAll()
                // Anything else (health, etc.) is public.
                .anyRequest().permitAll()
            )
            // On 401 return plain status (no default Spring login page).
            .exceptionHandling(eh -> eh.authenticationEntryPoint(
                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable);
        return http.build();
    }
}
