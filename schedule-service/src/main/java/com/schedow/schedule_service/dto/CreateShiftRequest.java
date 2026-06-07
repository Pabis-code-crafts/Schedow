package com.schedow.schedule_service.dto;

import java.time.LocalTime;

public class CreateShiftRequest {

private String name;

private LocalTime startTime;

private LocalTime endTime;

public CreateShiftRequest() {
}

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
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

}
