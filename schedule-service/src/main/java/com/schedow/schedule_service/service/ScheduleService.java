package com.schedow.schedule_service.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.entity.Shift;
import com.schedow.schedule_service.entity.WeeklyShiftAssignment;
import com.schedow.schedule_service.repository.ShiftRepository;
import com.schedow.schedule_service.repository.WeeklyShiftAssignmentRepository;

@Service
public class ScheduleService {

private final ShiftRepository shiftRepository;

private final WeeklyShiftAssignmentRepository assignmentRepository;

public ScheduleService(
        ShiftRepository shiftRepository,
        WeeklyShiftAssignmentRepository assignmentRepository
) {
    this.shiftRepository = shiftRepository;
    this.assignmentRepository = assignmentRepository;
}

public Shift createShift(CreateShiftRequest request) {

    Shift shift = new Shift();

    shift.setName(request.getName());
    shift.setStartTime(request.getStartTime());
    shift.setEndTime(request.getEndTime());

    return shiftRepository.save(shift);
}

public WeeklyShiftAssignment createAssignment(
        CreateWeeklyShiftAssignmentRequest request
) {

    Shift shift = shiftRepository.findById(request.getShiftId())
            .orElseThrow(() ->
                    new RuntimeException("Shift not found"));

    WeeklyShiftAssignment assignment =
            new WeeklyShiftAssignment();

    assignment.setWeekStartDate(request.getWeekStartDate());
    assignment.setDayOfWeek(request.getDayOfWeek());
    assignment.setAssignedUserId(request.getAssignedUserId());
    assignment.setShiftTemplate(shift);

    return assignmentRepository.save(assignment);
}

public List<WeeklyShiftAssignment> getAssignmentsByWeek(
LocalDate weekStartDate
) {
return assignmentRepository
.findByWeekStartDate(weekStartDate);
}

}
