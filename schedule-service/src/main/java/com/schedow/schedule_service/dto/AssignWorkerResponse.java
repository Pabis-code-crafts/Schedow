package com.schedow.schedule_service.dto;

public class AssignWorkerResponse {

     private boolean allowed;

    private String warning;

    private Long assignmentId;

    private String workerName;

    private String shiftName;

    private Integer currentHours;

    private Integer contractedHours;

    private Integer newTotalHours;

    private String status;

    private String message;

    public AssignWorkerResponse() {
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public String getShiftName() {
        return shiftName;
    }

    public void setShiftName(String shiftName) {
        this.shiftName = shiftName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isAllowed() {
        return allowed;
    }

    public void setAllowed(boolean allowed) {
        this.allowed = allowed;
    }

    public Integer getCurrentHours() {
        return currentHours;
    }

    public void setCurrentHours(Integer currentHours) {
        this.currentHours = currentHours;
    }

    public Integer getNewTotalHours() {
        return newTotalHours;
    }

    public void setNewTotalHours(Integer newTotalHours) {
        this.newTotalHours = newTotalHours;
    }

    public Integer getContractedHours() {
        return contractedHours;
    }

    public void setContractedHours(Integer contractedHours) {
        this.contractedHours = contractedHours;
    }

    public String getWarning() {
        return warning;
    }

    public void setWarning(String warning) {
        this.warning = warning;
    }
}