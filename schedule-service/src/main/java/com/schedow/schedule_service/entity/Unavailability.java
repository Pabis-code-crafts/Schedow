package com.schedow.schedule_service.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "unavailability")
public class Unavailability {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private Long userId;

private LocalDate unavailableDate;

private LocalTime startTime;

private LocalTime endTime;

private String reason;

public Unavailability() {
}

public Long getId() {
    return id;
}

public Long getUserId() {
    return userId;
}

public void setUserId(Long userId) {
    this.userId = userId;
}

public LocalDate getUnavailableDate() {
    return unavailableDate;
}

public void setUnavailableDate(LocalDate unavailableDate) {
    this.unavailableDate = unavailableDate;
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

public String getReason() {
    return reason;
}

public void setReason(String reason) {
    this.reason = reason;
}


}
