package com.schedow.schedule_service.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schedow.schedule_service.dto.CreateRecurringShiftAssignmentRequest;
import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateUnavailabilityRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.dto.DashboardResponse;
import com.schedow.schedule_service.dto.UserResponse;
import com.schedow.schedule_service.dto.WeekScheduleResponse;
import com.schedow.schedule_service.dto.WorkerScheduleResponse;
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

private final WorkerProvider workerProvider;

private final ShiftRepository shiftRepository;

private final WeeklyShiftAssignmentRepository assignmentRepository;

private final UnavailabilityRepository unavailabilityRepository;

private final RecurringShiftAssignmentRepository
        recurringAssignmentRepository;

private final SchedulingValidationService schedulingValidationService;

public ScheduleService(
        ShiftRepository shiftRepository,
        WeeklyShiftAssignmentRepository assignmentRepository,
        UnavailabilityRepository unavailabilityRepository,
        RecurringShiftAssignmentRepository recurringAssignmentRepository,
        WorkerProvider workerProvider,
        SchedulingValidationService schedulingValidationService
) { 

    this.shiftRepository = shiftRepository;
    this.assignmentRepository = assignmentRepository;
    this.unavailabilityRepository = unavailabilityRepository;
    this.recurringAssignmentRepository = recurringAssignmentRepository;
    this.workerProvider = workerProvider;
    this.schedulingValidationService = schedulingValidationService;
}
public Shift createShift(
        CreateShiftRequest request
) {

    Shift shift = new Shift();

    shift.setName(request.getName());

    shift.setStartTime(
            request.getStartTime()
    );

    shift.setEndTime(
            request.getEndTime()
    );

    return shiftRepository.save(shift);
}

public List<Shift> getAllShifts() {

    return shiftRepository.findAll();
}
public WeeklyShiftAssignment createAssignment(
        CreateWeeklyShiftAssignmentRequest request
) {

    Shift shift = shiftRepository.findById(
            request.getShiftId()
    ).orElseThrow(() ->
            new RuntimeException("Shift not found")
    );

    schedulingValidationService.validateAssignment(
            request,
            shift
    );

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

    assignment.setShiftTemplate(
            shift
    );

    return assignmentRepository.save(
            assignment
    );
}
public List<WeeklyShiftAssignment>
getAssignmentsByWeek(
        LocalDate weekStartDate
) {

    return assignmentRepository
            .findByWeekStartDate(
                    weekStartDate
            );
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

public List<Unavailability>
getUserUnavailability(
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
            new RuntimeException(
                    "Shift not found"
            ));

    RecurringShiftAssignment assignment =
            new RecurringShiftAssignment();

    assignment.setUserId(
            request.getUserId()
    );

    assignment.setDayOfWeek(
            request.getDayOfWeek()
    );

    assignment.setShift(shift);

    return recurringAssignmentRepository
            .save(assignment);
}

public List<RecurringShiftAssignment>
getRecurringAssignments(
        Long userId
) {

    return recurringAssignmentRepository
            .findByUserId(userId);
}

public List<WeekScheduleResponse> getWeekSchedule(
        LocalDate weekStartDate
) {

    List<WeeklyShiftAssignment> assignments =
            assignmentRepository.findByWeekStartDate(
                    weekStartDate
            );

    List<UserResponse> workers =
            workerProvider.getWorkers();

    List<WeekScheduleResponse> response =
            new ArrayList<>();

    for (WeeklyShiftAssignment assignment : assignments) {

        WeekScheduleResponse dto =
                new WeekScheduleResponse();

        dto.setDayOfWeek(
                assignment.getDayOfWeek()
        );

        dto.setShiftId(
                assignment.getShiftTemplate().getId()
        );

        dto.setShiftName(
                assignment.getShiftTemplate().getName()
        );

        dto.setWorkerId(
                assignment.getAssignedUserId()
        );

        workers.stream()
                .filter(w ->
                        w.getId().equals(
                                assignment.getAssignedUserId()
                        ))
                .findFirst()
                .ifPresent(worker ->
                        dto.setWorkerName(
                                worker.getName()
                        ));

        response.add(dto);
    }

    return response;
}

public List<WorkerScheduleResponse> getWorkerSchedule(
        Long userId
) {

    List<WeeklyShiftAssignment> assignments =
            assignmentRepository.findByAssignedUserId(
                    userId
            );

    List<WorkerScheduleResponse> response =
            new ArrayList<>();

    for (WeeklyShiftAssignment assignment : assignments) {

        WorkerScheduleResponse dto =
                new WorkerScheduleResponse();

        dto.setDayOfWeek(
                assignment.getDayOfWeek()
        );

        dto.setShiftName(
                assignment.getShiftTemplate().getName()
        );

        dto.setStartTime(
                assignment.getShiftTemplate()
                        .getStartTime()
                        .toString()
        );

        dto.setEndTime(
                assignment.getShiftTemplate()
                        .getEndTime()
                        .toString()
        );

        response.add(dto);
    }

    return response;
}

public DashboardResponse getDashboard() {

    DashboardResponse response =
            new DashboardResponse();

    response.setTotalAssignments(
            assignmentRepository.count() > Integer.MAX_VALUE
                    ? Integer.MAX_VALUE
                    : (int) assignmentRepository.count()
    );

    response.setTotalShifts(
            shiftRepository.findAll().size()
    );

    response.setTotalWorkers(
            workerProvider.getWorkers().size()
    );

    response.setUnavailableWorkers(
            (int) unavailabilityRepository.findAll()
                    .stream()
                    .map(Unavailability::getUserId)
                    .distinct()
                    .count()
    );

    return response;
}
}
