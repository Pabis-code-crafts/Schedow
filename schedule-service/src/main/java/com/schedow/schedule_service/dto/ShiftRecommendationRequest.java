package com.schedow.schedule_service.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;

public class ShiftRecommendationRequest {


private Long shiftId;

private DayOfWeek dayOfWeek;

private LocalDate date;

private LocalDate weekStartDate;

private Long assignmentId;

public ShiftRecommendationRequest() {
}

public Long getShiftId() {
    return shiftId;
}

public void setShiftId(Long shiftId) {
    this.shiftId = shiftId;
}

public DayOfWeek getDayOfWeek() {
    return dayOfWeek;
}

public void setDayOfWeek(DayOfWeek dayOfWeek) {
    this.dayOfWeek = dayOfWeek;
}

public LocalDate getDate() {
    return date;
}

public void setDate(LocalDate date) {
    this.date = date;
}

public LocalDate getWeekStartDate() {
    return weekStartDate;
}

public void setWeekStartDate(LocalDate weekStartDate) {
    this.weekStartDate = weekStartDate;
}

public Long getAssignmentId() {
    return assignmentId;
}

public void setAssignmentId(Long assignmentId) {
    this.assignmentId = assignmentId;
}


}
