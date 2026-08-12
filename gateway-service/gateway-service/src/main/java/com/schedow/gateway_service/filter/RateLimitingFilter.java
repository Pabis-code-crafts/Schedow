package com.schedow.gateway_service.filter;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.schedow.gateway_service.config.RateLimitProperties;
import com.schedow.gateway_service.config.RateLimitProperties.Limit;
import com.schedow.gateway_service.ratelimit.InMemoryTokenBucketRateLimiter;
import com.schedow.gateway_service.ratelimit.RateLimitDecision;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import reactor.core.publisher.Mono;

@Component
public class RateLimitingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);
    private static final String OVERALL_SCOPE = "api";
    private static final String AI_SCOPE = "ai";
    private static final String API_PATH_PREFIX = "/api";
    private static final String AI_PATH_PREFIX = "/api/v1/ai";

    private final RateLimitProperties properties;
    private final InMemoryTokenBucketRateLimiter limiter;
    private final MeterRegistry meterRegistry;

    public RateLimitingFilter(
            RateLimitProperties properties,
            InMemoryTokenBucketRateLimiter limiter,
            MeterRegistry meterRegistry) {
        this.properties = properties;
        this.limiter = limiter;
        this.meterRegistry = meterRegistry;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().pathWithinApplication().value();
        if (!matchesPathPrefix(path, API_PATH_PREFIX)) {
            return chain.filter(exchange);
        }

        String key = resolveClientKey(exchange);

        RateLimitDecision overallDecision = evaluate(OVERALL_SCOPE, key, properties.getOverall());
        if (!overallDecision.allowed()) {
            return reject(exchange, OVERALL_SCOPE, key, "/api/**", overallDecision.retryAfterSeconds());
        }

        if (matchesPathPrefix(path, AI_PATH_PREFIX)) {
            RateLimitDecision aiDecision = evaluate(AI_SCOPE, key, properties.getAi());
            if (!aiDecision.allowed()) {
                return reject(exchange, AI_SCOPE, key, "/api/v1/ai/**", aiDecision.retryAfterSeconds());
            }
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private RateLimitDecision evaluate(String scope, String key, Limit limit) {
        if (!limit.isEnabled()) {
            return RateLimitDecision.allowed(Double.POSITIVE_INFINITY);
        }

        return limiter.tryConsume(scope, key, limit.getRequests(), limit.getWindowSeconds());
    }

    private Mono<Void> reject(ServerWebExchange exchange, String scope, String key, String pathGroup, long retryAfterSeconds) {
        Counter.builder("schedow.gateway.rate_limit.rejected")
                .description("Gateway requests rejected by rate limiting")
                .tag("scope", scope)
                .tag("path", pathGroup)
                .register(meterRegistry)
                .increment();

        log.warn("Rate limit exceeded scope={} keyHash={} pathGroup={}", scope, hashKey(key), pathGroup);

        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().set(HttpHeaders.RETRY_AFTER, Long.toString(retryAfterSeconds));
        return exchange.getResponse().setComplete();
    }


    private boolean matchesPathPrefix(String path, String prefix) {
        return path.equals(prefix) || path.startsWith(prefix + "/");
    }
    private String resolveClientKey(ServerWebExchange exchange) {
        String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        if (remoteAddress != null && remoteAddress.getAddress() != null) {
            return remoteAddress.getAddress().getHostAddress();
        }

        return "unknown-client";
    }

    private String hashKey(String key) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(key.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash, 0, 6);
        } catch (NoSuchAlgorithmException ex) {
            return "unavailable";
        }
    }
}

