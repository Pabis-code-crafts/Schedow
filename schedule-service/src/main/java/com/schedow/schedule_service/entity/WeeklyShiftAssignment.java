package com.schedow.schedule_service.entity;

import java.time.DayOfWeek;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "weekly_shift_assignments")
public class WeeklyShiftAssignment {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private LocalDate weekStartDate;

@Enumerated(EnumType.STRING)
private DayOfWeek dayOfWeek;

private Long assignedUserId;

@ManyToOne
@JoinColumn(name = "shift_template_id")
private Shift shiftTemplate;

public WeeklyShiftAssignment() {
}

public Long getId() {
    return id;
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

public Shift getShiftTemplate() {
    return shiftTemplate;
}

public void setShiftTemplate(Shift shiftTemplate) {
    this.shiftTemplate = shiftTemplate;
}


}
