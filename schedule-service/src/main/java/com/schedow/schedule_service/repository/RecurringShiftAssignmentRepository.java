package com.schedow.schedule_service.repository;

import java.time.DayOfWeek;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.schedow.schedule_service.entity.RecurringShiftAssignment;

public interface RecurringShiftAssignmentRepository
extends JpaRepository<RecurringShiftAssignment, Long> {


List<RecurringShiftAssignment>
findByDayOfWeek(DayOfWeek dayOfWeek);

List<RecurringShiftAssignment>
findByUserId(Long userId);


}
