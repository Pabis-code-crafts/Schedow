package com.schedow.schedule_service.entity;

import java.time.DayOfWeek;

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
@Table(name = "recurring_shift_assignments")
public class RecurringShiftAssignment {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private Long userId;

@Enumerated(EnumType.STRING)
private DayOfWeek dayOfWeek;

@ManyToOne
@JoinColumn(name = "shift_id")
private Shift shift;

public RecurringShiftAssignment() {
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

public DayOfWeek getDayOfWeek() {
    return dayOfWeek;
}

public void setDayOfWeek(DayOfWeek dayOfWeek) {
    this.dayOfWeek = dayOfWeek;
}

public Shift getShift() {
    return shift;
}

public void setShift(Shift shift) {
    this.shift = shift;
}


}
