package com.schedow.gateway_service.ratelimit;

public record RateLimitDecision(boolean allowed, double remainingTokens, long retryAfterSeconds) {

    public static RateLimitDecision allowed(double remainingTokens) {
        return new RateLimitDecision(true, remainingTokens, 0L);
    }

    public static RateLimitDecision rejected(long retryAfterSeconds) {
        return new RateLimitDecision(false, 0.0d, retryAfterSeconds);
    }
}
