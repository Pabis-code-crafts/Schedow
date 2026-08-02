package com.schedow.schedule_service.dto;

public class DashboardResponse {

    private int totalAssignments;
    private int totalWorkers;
    private int totalShifts;
    private int unavailableWorkers;

    public DashboardResponse() {
    }

    public int getTotalAssignments() {
        return totalAssignments;
    }

    public void setTotalAssignments(int totalAssignments) {
        this.totalAssignments = totalAssignments;
    }

    public int getTotalWorkers() {
        return totalWorkers;
    }

    public void setTotalWorkers(int totalWorkers) {
        this.totalWorkers = totalWorkers;
    }

    public int getTotalShifts() {
        return totalShifts;
    }

    public void setTotalShifts(int totalShifts) {
        this.totalShifts = totalShifts;
    }

    public int getUnavailableWorkers() {
        return unavailableWorkers;
    }

    public void setUnavailableWorkers(int unavailableWorkers) {
        this.unavailableWorkers = unavailableWorkers;
    }
}