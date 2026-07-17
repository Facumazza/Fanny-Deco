package com.artesa.common.ratelimit;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class InMemoryRateLimiterTest {

    @Test
    void allowsUpToLimit_thenDenies() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();
        // Generous window so timing can't sneak the 4th request through.
        for (int i = 1; i <= 3; i++) {
            assertThat(limiter.tryAcquire("k", 3, 60_000))
                .as("attempt %d within the limit", i)
                .isTrue();
        }
        assertThat(limiter.tryAcquire("k", 3, 60_000))
            .as("4th attempt should be denied")
            .isFalse();
    }

    @Test
    void separateKeysDoNotShareCounters() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();
        for (int i = 0; i < 3; i++) limiter.tryAcquire("a", 3, 60_000);
        assertThat(limiter.tryAcquire("a", 3, 60_000)).isFalse();
        // A different key still starts fresh.
        assertThat(limiter.tryAcquire("b", 3, 60_000)).isTrue();
    }

    @Test
    void windowResetsAfterExpiry() throws Exception {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();
        // Fill the bucket with a tiny window.
        assertThat(limiter.tryAcquire("k", 1, 50)).isTrue();
        assertThat(limiter.tryAcquire("k", 1, 50)).isFalse();
        Thread.sleep(80);
        assertThat(limiter.tryAcquire("k", 1, 50)).isTrue();
    }
}
