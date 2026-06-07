package com.schedow.schedule_service.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.schedow.schedule_service.entity.WeeklyShiftAssignment;

public interface WeeklyShiftAssignmentRepository extends JpaRepository<WeeklyShiftAssignment, Long> {
    List<WeeklyShiftAssignment>findByWeekStartDate(LocalDate weekStartDate);

}
 