package com.schedow.schedule_service.dto;

public class AssignmentValidationResponse {

    private boolean valid;
    private String reason;

    public AssignmentValidationResponse() {
    }

    public AssignmentValidationResponse(boolean valid, String reason) {
        this.valid = valid;
        this.reason = reason;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
