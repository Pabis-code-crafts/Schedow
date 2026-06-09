package com.schedow.schedule_service.dto;

import java.time.DayOfWeek;

public class CreateRecurringShiftAssignmentRequest {

private Long userId;

private DayOfWeek dayOfWeek;

private Long shiftId;

public CreateRecurringShiftAssignmentRequest() {
}

public Long getUserId() {
    return userId;
}

public void setUserId(Long userId) {
    this.userId = userId;
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


}
