package com.schedow.schedule_service.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;

public class CreateWeeklyShiftAssignmentRequest {

private LocalDate weekStartDate;

private DayOfWeek dayOfWeek;

private Long assignedUserId;

private Long shiftId;

public CreateWeeklyShiftAssignmentRequest() {
}

public LocalDate getWeekStartDate() {
    return weekStartDate;
}

public void setWeekStartDate(LocalDate weekStartDate) {
    this.weekStartDate = weekStartDate;
}

public DayOfWeek getDayOfWeek() {
    return dayOfWeek;
}

public void setDayOfWeek(DayOfWeek dayOfWeek) {
    this.dayOfWeek = dayOfWeek;
}

public Long getAssignedUserId() {
    return assignedUserId;
}

public void setAssignedUserId(Long assignedUserId) {
    this.assignedUserId = assignedUserId;
}

public Long getShiftId() {
    return shiftId;
}

public void setShiftId(Long shiftId) {
    this.shiftId = shiftId;
}


}
