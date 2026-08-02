package com.schedow.ai_services.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;

public class RecommendationRequest {

    private LocalDate date;

    private DayOfWeek dayOfWeek;

    private Long shiftId;

    public RecommendationRequest() {
    }

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

}