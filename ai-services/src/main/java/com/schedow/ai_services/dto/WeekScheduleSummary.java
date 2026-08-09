package com.schedow.ai_services.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class WeekScheduleSummary {

    private LocalDate weekStartDate;
    private int totalShiftSlots;
    private int assignedShiftSlots;
    private int unfilledShiftSlots;
    private List<ShiftSlot> assignedSlots = new ArrayList<>();
    private List<ShiftSlot> unfilledSlots = new ArrayList<>();

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(LocalDate weekStartDate) {
        this.weekStartDate = weekStartDate;
    }

    public int getTotalShiftSlots() {
        return totalShiftSlots;
    }

    public void setTotalShiftSlots(int totalShiftSlots) {
        this.totalShiftSlots = totalShiftSlots;
    }

    public int getAssignedShiftSlots() {
        return assignedShiftSlots;
    }

    public void setAssignedShiftSlots(int assignedShiftSlots) {
        this.assignedShiftSlots = assignedShiftSlots;
    }

    public int getUnfilledShiftSlots() {
        return unfilledShiftSlots;
    }

    public void setUnfilledShiftSlots(int unfilledShiftSlots) {
        this.unfilledShiftSlots = unfilledShiftSlots;
    }

    public List<ShiftSlot> getAssignedSlots() {
        return assignedSlots;
    }

    public void setAssignedSlots(List<ShiftSlot> assignedSlots) {
        this.assignedSlots = assignedSlots;
    }

    public List<ShiftSlot> getUnfilledSlots() {
        return unfilledSlots;
    }

    public void setUnfilledSlots(List<ShiftSlot> unfilledSlots) {
        this.unfilledSlots = unfilledSlots;
    }

    public static class ShiftSlot {

        private LocalDate date;
        private DayOfWeek dayOfWeek;
        private Long shiftId;
        private String shiftName;
        private LocalTime startTime;
        private LocalTime endTime;
        private Long assignmentId;
        private Long workerId;
        private String workerName;

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public DayOfWeek getDayOfWeek() {
            return dayOfWeek;
        }

        public void setDayOfWeek(DayOfWeek dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
        }

        public Long getShiftId() {
            return shiftId;
        }

        public void setShiftId(Long shiftId) {
            this.shiftId = shiftId;
        }

        public String getShiftName() {
            return shiftName;
        }

        public void setShiftName(String shiftName) {
            this.shiftName = shiftName;
        }

        public LocalTime getStartTime() {
            return startTime;
        }

        public void setStartTime(LocalTime startTime) {
            this.startTime = startTime;
        }

        public LocalTime getEndTime() {
            return endTime;
        }

        public void setEndTime(LocalTime endTime) {
            this.endTime = endTime;
        }

        public Long getAssignmentId() {
            return assignmentId;
        }

        public void setAssignmentId(Long assignmentId) {
            this.assignmentId = assignmentId;
        }

        public Long getWorkerId() {
            return workerId;
        }

        public void setWorkerId(Long workerId) {
            this.workerId = workerId;
        }

        public String getWorkerName() {
            return workerName;
        }

        public void setWorkerName(String workerName) {
            this.workerName = workerName;
        }
    }
}
