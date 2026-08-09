package com.schedow.schedule_service.dto;

public class UpdateAssignmentWorkerRequest {

    private Long newUserId;

    public UpdateAssignmentWorkerRequest() {
    }

    public Long getNewUserId() {
        return newUserId;
    }

    public void setNewUserId(Long newUserId) {
        this.newUserId = newUserId;
    }
}