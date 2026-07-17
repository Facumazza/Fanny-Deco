package com.artesa.common.ratelimit;

import com.artesa.common.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Denies requests once a caller has crossed the per-IP threshold for the
 * matched path. Runs after Spring Security (interceptor stage), so it only
 * kicks in for endpoints security lets through — this is fine for our two
 * targets: POST /api/admin/auth/login and POST /api/orders.
 *
 * Client IP resolution honors X-Forwarded-For when present (behind a reverse
 * proxy) — configure your proxy so this header cannot be spoofed by clients
 * (e.g. always overwrite, don't append).
 */
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final InMemoryRateLimiter limiter;
    private final int limit;
    private final long windowMillis;

    public RateLimitInterceptor(InMemoryRateLimiter limiter, int limit, long windowMillis) {
        this.limiter = limiter;
        this.limit = limit;
        this.windowMillis = windowMillis;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler)
            throws Exception {
        String key = req.getMethod() + ":" + req.getServletPath() + ":" + clientIp(req);
        if (limiter.tryAcquire(key, limit, windowMillis)) {
            return true;
        }
        res.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // Advisory only — many clients ignore it, but well-behaved ones will back off.
        res.setHeader("Retry-After", String.valueOf(Math.max(1, windowMillis / 1000)));
        JSON.writeValue(res.getOutputStream(),
            ApiError.of("RATE_LIMIT_EXCEEDED",
                "Demasiadas solicitudes. Esperá unos segundos e intentá de nuevo."));
        return false;
    }

    private static String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // First entry is the original client; anything after is intermediate proxies.
            int comma = xff.indexOf(',');
            return (comma > 0 ? xff.substring(0, comma) : xff).trim();
        }
        return req.getRemoteAddr();
    }
}
