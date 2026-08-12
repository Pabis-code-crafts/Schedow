package com.schedow.gateway_service.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class InMemoryTokenBucketRateLimiterTest {

    @Test
    void rejectsWhenBucketIsEmpty() {
        InMemoryTokenBucketRateLimiter limiter = new InMemoryTokenBucketRateLimiter();

        assertThat(limiter.tryConsume("api", "client-1", 2, 60).allowed()).isTrue();
        assertThat(limiter.tryConsume("api", "client-1", 2, 60).allowed()).isTrue();

        RateLimitDecision rejected = limiter.tryConsume("api", "client-1", 2, 60);

        assertThat(rejected.allowed()).isFalse();
        assertThat(rejected.retryAfterSeconds()).isGreaterThan(0);
    }

    @Test
    void separatesBucketsByScopeAndClientKey() {
        InMemoryTokenBucketRateLimiter limiter = new InMemoryTokenBucketRateLimiter();

        assertThat(limiter.tryConsume("api", "client-1", 1, 60).allowed()).isTrue();
        assertThat(limiter.tryConsume("api", "client-1", 1, 60).allowed()).isFalse();

        assertThat(limiter.tryConsume("ai", "client-1", 1, 60).allowed()).isTrue();
        assertThat(limiter.tryConsume("api", "client-2", 1, 60).allowed()).isTrue();
    }
}
