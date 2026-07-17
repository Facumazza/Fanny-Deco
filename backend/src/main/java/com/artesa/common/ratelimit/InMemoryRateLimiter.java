package com.artesa.common.ratelimit;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window in-memory rate limiter keyed by an arbitrary string (usually
 * "endpoint:ip"). Not distributed — good enough for a single-instance shop.
 * If we ever scale to more than one backend node, replace with a Redis-based
 * counter or move behind a rate-limiting reverse proxy (Cloudflare, etc.).
 */
@Component
public class InMemoryRateLimiter {

    private static final class Window {
        int count;
        long startNanos;
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    /**
     * @return true if the request is allowed, false if the caller has exceeded
     *         `limit` requests inside the last `windowMillis` milliseconds.
     */
    public boolean tryAcquire(String key, int limit, long windowMillis) {
        long now = System.nanoTime();
        long windowNanos = windowMillis * 1_000_000L;

        // computeIfAbsent + synchronized block keeps this correct under
        // concurrent calls for the same key without a global lock.
        Window w = windows.computeIfAbsent(key, k -> {
            Window nw = new Window();
            nw.startNanos = now;
            return nw;
        });
        synchronized (w) {
            if (now - w.startNanos >= windowNanos) {
                w.startNanos = now;
                w.count = 0;
            }
            w.count++;
            return w.count <= limit;
        }
    }

    /** Test-only: reset all counters. */
    void reset() {
        windows.clear();
    }

    /** Bounded-size fallback used only if the map grows unreasonably large. */
    int size() {
        return windows.size();
    }
}
