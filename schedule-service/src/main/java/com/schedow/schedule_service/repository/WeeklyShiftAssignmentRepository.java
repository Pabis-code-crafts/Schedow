package com.schedow.schedule_service.repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.schedow.schedule_service.entity.WeeklyShiftAssignment;

public interface WeeklyShiftAssignmentRepository
        extends JpaRepository<WeeklyShiftAssignment, Long> {

    List<WeeklyShiftAssignment> findByWeekStartDate(
            LocalDate weekStartDate
    );

    List<WeeklyShiftAssignment> findByAssignedUserId(
            Long assignedUserId
    );

    List<WeeklyShiftAssignment> findByAssignedUserIdAndWeekStartDate(
            Long assignedUserId,
            LocalDate weekStartDate
    );

    Optional<WeeklyShiftAssignment> findByWeekStartDateAndDayOfWeekAndShiftTemplateId(
            LocalDate weekStartDate,
            DayOfWeek dayOfWeek,
            Long shiftTemplateId
    );
}