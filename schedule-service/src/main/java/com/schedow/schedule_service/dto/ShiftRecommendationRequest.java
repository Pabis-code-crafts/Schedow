package com.schedow.schedule_service.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;

public class ShiftRecommendationRequest {


private Long shiftId;

private DayOfWeek dayOfWeek;

private LocalDate date;

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


}
