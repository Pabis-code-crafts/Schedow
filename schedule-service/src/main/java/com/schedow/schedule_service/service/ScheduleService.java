package com.schedow.schedule_service.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schedow.schedule_service.dto.CreateRecurringShiftAssignmentRequest;
import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateUnavailabilityRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.entity.RecurringShiftAssignment;
import com.schedow.schedule_service.entity.Shift;
import com.schedow.schedule_service.entity.Unavailability;
import com.schedow.schedule_service.entity.WeeklyShiftAssignment;
import com.schedow.schedule_service.repository.RecurringShiftAssignmentRepository;
import com.schedow.schedule_service.repository.ShiftRepository;
import com.schedow.schedule_service.repository.UnavailabilityRepository;
import com.schedow.schedule_service.repository.WeeklyShiftAssignmentRepository;

@Service
public class ScheduleService {

private final ShiftRepository shiftRepository;

private final WeeklyShiftAssignmentRepository assignmentRepository;

private final UnavailabilityRepository unavailabilityRepository;

private final RecurringShiftAssignmentRepository recurringAssignmentRepository;

public ScheduleService(
        ShiftRepository shiftRepository,
        WeeklyShiftAssignmentRepository assignmentRepository,
        UnavailabilityRepository unavailabilityRepository, RecurringShiftAssignmentRepository recurringAssignmentRepository
) {
    this.shiftRepository = shiftRepository;
    this.assignmentRepository = assignmentRepository;
    this.unavailabilityRepository = unavailabilityRepository;
    this.recurringAssignmentRepository = recurringAssignmentRepository;
    
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

    Shift shift = shiftRepository.findById(
            request.getShiftId()
    ).orElseThrow(() ->
            new RuntimeException("Shift not found"));

    WeeklyShiftAssignment assignment =
            new WeeklyShiftAssignment();

    assignment.setWeekStartDate(
            request.getWeekStartDate()
    );

    assignment.setDayOfWeek(
            request.getDayOfWeek()
    );

    assignment.setAssignedUserId(
            request.getAssignedUserId()
    );

    assignment.setShiftTemplate(shift);

    return assignmentRepository.save(assignment);
}

public List<WeeklyShiftAssignment> getAssignmentsByWeek(
        LocalDate weekStartDate
) {

    return assignmentRepository
            .findByWeekStartDate(weekStartDate);
}

public Unavailability createUnavailability(
        CreateUnavailabilityRequest request
) {

    Unavailability unavailability =
            new Unavailability();

    unavailability.setUserId(
            request.getUserId()
    );

    unavailability.setUnavailableDate(
            request.getUnavailableDate()
    );

    unavailability.setStartTime(
            request.getStartTime()
    );

    unavailability.setEndTime(
            request.getEndTime()
    );

    unavailability.setReason(
            request.getReason()
    );

    return unavailabilityRepository
            .save(unavailability);
}

public List<Unavailability> getUserUnavailability(
        Long userId
) {

    return unavailabilityRepository
            .findByUserId(userId);
}
public RecurringShiftAssignment
createRecurringAssignment(
CreateRecurringShiftAssignmentRequest request
) {

Shift shift = shiftRepository.findById(
        request.getShiftId()
).orElseThrow(() ->
        new RuntimeException("Shift not found"));

RecurringShiftAssignment assignment =
        new RecurringShiftAssignment();

assignment.setUserId(request.getUserId());

assignment.setDayOfWeek(
        request.getDayOfWeek()
);

assignment.setShift(shift);

return recurringAssignmentRepository
        .save(assignment);


}

public List<RecurringShiftAssignment>
getRecurringAssignments(Long userId) {


return recurringAssignmentRepository
        .findByUserId(userId);


}
public List<Shift> getAllShifts() {


return shiftRepository.findAll();


}


}
