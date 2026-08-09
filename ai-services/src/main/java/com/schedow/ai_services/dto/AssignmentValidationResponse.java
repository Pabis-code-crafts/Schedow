package com.schedow.ai_services.dto;

public class AssignmentValidationResponse {

    private boolean valid;
    private String reason;

    public AssignmentValidationResponse() {
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
