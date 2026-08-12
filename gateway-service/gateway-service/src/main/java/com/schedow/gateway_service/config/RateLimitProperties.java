package com.schedow.gateway_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "schedow.rate-limit")
public class RateLimitProperties {

    private Limit overall = new Limit(true, 100, 60);
    private Limit ai = new Limit(true, 10, 60);

    public Limit getOverall() {
        return overall;
    }

    public void setOverall(Limit overall) {
        this.overall = overall;
    }

    public Limit getAi() {
        return ai;
    }

    public void setAi(Limit ai) {
        this.ai = ai;
    }

    public static class Limit {
        private boolean enabled;
        private long requests;
        private long windowSeconds;

        public Limit() {
        }

        public Limit(boolean enabled, long requests, long windowSeconds) {
            this.enabled = enabled;
            this.requests = requests;
            this.windowSeconds = windowSeconds;
        }

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public long getRequests() {
            return requests;
        }

        public void setRequests(long requests) {
            this.requests = requests;
        }

        public long getWindowSeconds() {
            return windowSeconds;
        }

        public void setWindowSeconds(long windowSeconds) {
            this.windowSeconds = windowSeconds;
        }
    }
}
