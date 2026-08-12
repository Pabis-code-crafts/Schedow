package com.schedow.gateway_service.ratelimit;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class InMemoryTokenBucketRateLimiter {

    private static final long CLEANUP_INTERVAL_NANOS = Duration.ofMinutes(1).toNanos();

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private volatile long lastCleanupNanos = System.nanoTime();

    public RateLimitDecision tryConsume(String scope, String key, long capacity, long windowSeconds) {
        if (capacity <= 0 || windowSeconds <= 0) {
            return RateLimitDecision.rejected(windowSeconds);
        }

        long now = System.nanoTime();
        cleanupIfNeeded(now, windowSeconds);

        String bucketKey = scope + ":" + key;
        Bucket bucket = buckets.computeIfAbsent(bucketKey, ignored -> new Bucket(capacity, now));

        synchronized (bucket) {
            refill(bucket, capacity, windowSeconds, now);
            bucket.lastSeenNanos = now;

            if (bucket.tokens >= 1.0d) {
                bucket.tokens -= 1.0d;
                return RateLimitDecision.allowed(bucket.tokens);
            }

            double refillPerNano = capacity / (windowSeconds * 1_000_000_000.0d);
            long retryAfterSeconds = Math.max(1L, (long) Math.ceil((1.0d - bucket.tokens) / refillPerNano / 1_000_000_000.0d));
            return RateLimitDecision.rejected(retryAfterSeconds);
        }
    }

    private void refill(Bucket bucket, long capacity, long windowSeconds, long now) {
        long elapsedNanos = now - bucket.lastRefillNanos;
        if (elapsedNanos <= 0) {
            return;
        }

        double refillPerNano = capacity / (windowSeconds * 1_000_000_000.0d);
        bucket.tokens = Math.min(capacity, bucket.tokens + elapsedNanos * refillPerNano);
        bucket.lastRefillNanos = now;
    }

    private void cleanupIfNeeded(long now, long windowSeconds) {
        if (now - lastCleanupNanos < CLEANUP_INTERVAL_NANOS) {
            return;
        }

        lastCleanupNanos = now;
        long staleAfterNanos = Duration.ofSeconds(Math.max(60L, windowSeconds * 2)).toNanos();
        buckets.entrySet().removeIf(entry -> now - entry.getValue().lastSeenNanos > staleAfterNanos);
    }

    private static class Bucket {
        private double tokens;
        private long lastRefillNanos;
        private long lastSeenNanos;

        private Bucket(long capacity, long now) {
            this.tokens = capacity;
            this.lastRefillNanos = now;
            this.lastSeenNanos = now;
        }
    }
}
