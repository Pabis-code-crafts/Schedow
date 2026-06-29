package com.schedow.schedule_service.dto;

public class ShiftRecommendationResponse {

    private Long userId;

    private String workerName;

    private Integer fairnessScore;

    private Boolean recurringWorker;

    private String reason;

    public ShiftRecommendationResponse() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public Integer getFairnessScore() {
        return fairnessScore;
    }

    public void setFairnessScore(Integer fairnessScore) {
        this.fairnessScore = fairnessScore;
    }

    public Boolean getRecurringWorker() {
        return recurringWorker;
    }

    public void setRecurringWorker(Boolean recurringWorker) {
        this.recurringWorker = recurringWorker;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

}