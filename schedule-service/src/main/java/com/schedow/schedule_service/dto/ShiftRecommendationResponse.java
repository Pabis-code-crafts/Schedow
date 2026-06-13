package com.schedow.schedule_service.dto;

public class ShiftRecommendationResponse {

private Long userId;

private Integer score;

private String reason;

public ShiftRecommendationResponse() {
}

public Long getUserId() {
    return userId;
}

public void setUserId(Long userId) {
    this.userId = userId;
}

public Integer getScore() {
    return score;
}

public void setScore(Integer score) {
    this.score = score;
}

public String getReason() {
    return reason;
}

public void setReason(String reason) {
    this.reason = reason;
}


}
