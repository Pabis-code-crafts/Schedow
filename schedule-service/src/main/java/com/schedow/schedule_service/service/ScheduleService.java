package com.schedow.schedule_service.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schedow.schedule_service.dto.AssignWorkerRequest;
import com.schedow.schedule_service.dto.AssignWorkerResponse;
import com.schedow.schedule_service.dto.CreateRecurringShiftAssignmentRequest;
import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateUnavailabilityRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.dto.DashboardResponse;
import com.schedow.schedule_service.dto.ShiftRecommendationRequest;
import com.schedow.schedule_service.dto.ShiftRecommendationResponse;
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

public ScheduleService(
        ShiftRepository shiftRepository,
        WeeklyShiftAssignmentRepository assignmentRepository,
        UnavailabilityRepository unavailabilityRepository,
        RecurringShiftAssignmentRepository recurringAssignmentRepository,
        WorkerProvider workerProvider
) {

    this.shiftRepository = shiftRepository;
    this.assignmentRepository = assignmentRepository;
    this.unavailabilityRepository = unavailabilityRepository;
    this.recurringAssignmentRepository = recurringAssignmentRepository;
    this.workerProvider = workerProvider;
}
public AssignWorkerResponse assignWorker(
        AssignWorkerRequest request
) {

    Shift shift = shiftRepository.findById(
            request.getShiftId()
    ).orElseThrow(() ->
            new RuntimeException("Shift not found")
    );

    validateNoShiftConflict(
        request,
        shift
);

validateContractedHours(
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
            request.getUserId()
    );

    assignment.setShiftTemplate(
            shift
    );

    WeeklyShiftAssignment saved =
            assignmentRepository.save(
                    assignment
            );

    UserResponse worker =
            workerProvider.getWorkers()
                    .stream()
                    .filter(w ->
                            w.getId().equals(
                                    request.getUserId()
                            )
                    )
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Worker not found"
                            )
                    );

    AssignWorkerResponse response =
            new AssignWorkerResponse();

    response.setAssignmentId(
            saved.getId()
    );

    response.setWorkerName(
            worker.getName()
    );

    response.setShiftName(
            shift.getName()
    );

    response.setStatus(
            "SUCCESS"
    );

    response.setMessage(
            "Worker assigned successfully."
    );

    return response;
}

private void validateContractedHours(
        AssignWorkerRequest request,
        Shift newShift
) {

    UserResponse worker = workerProvider.getWorkers()
            .stream()
            .filter(w -> w.getId().equals(request.getUserId()))
            .findFirst()
            .orElseThrow(() ->
                    new RuntimeException("Worker not found"));

    int assignedHours =
            calculateAssignedHours(
                    request.getUserId()
            );

    int newShiftHours =
            (int) java.time.Duration
                    .between(
                            newShift.getStartTime(),
                            newShift.getEndTime()
                    )
                    .toHours();

    int totalHours =
            assignedHours + newShiftHours;

    if (totalHours > worker.getContractedHours()) {

        throw new RuntimeException(
                "Assignment exceeds contracted hours."
        );
    }
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
System.out.println("===== Incoming Request =====");
System.out.println("Week: " + request.getWeekStartDate());
System.out.println("Day: " + request.getDayOfWeek());
System.out.println("User: " + request.getAssignedUserId());
System.out.println("Shift: " + request.getShiftId());
System.out.println("============================");
    Shift shift = shiftRepository.findById(
            request.getShiftId()
    ).orElseThrow(() ->
            new RuntimeException(
                    "Shift not found"
            ));

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

assignment.setAssignedUserId(request.getAssignedUserId());
assignment.setShiftTemplate(shift);

WeeklyShiftAssignment saved = assignmentRepository.save(assignment);

System.out.println("Saved assignment:");
System.out.println("ID: " + saved.getId());
System.out.println("Week: " + saved.getWeekStartDate());
System.out.println("Day: " + saved.getDayOfWeek());
System.out.println("User: " + saved.getAssignedUserId());

return saved;
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
public List<ShiftRecommendationResponse> getRecommendations(
        ShiftRecommendationRequest request
) {

    Shift shift = shiftRepository.findById(request.getShiftId())
            .orElseThrow(() -> new RuntimeException("Shift not found"));

    List<UserResponse> workers = workerProvider.getWorkers();

    List<ShiftRecommendationResponse> recommendations =
            new ArrayList<>();

    Long recurringWorkerId = null;

    List<RecurringShiftAssignment> recurringAssignments =
            recurringAssignmentRepository.findByDayOfWeek(
                    request.getDayOfWeek()
            );

    for (RecurringShiftAssignment assignment : recurringAssignments) {

        if (assignment.getShift().getId().equals(shift.getId())) {

            recurringWorkerId = assignment.getUserId();
            break;
        }
    }

    for (UserResponse worker : workers) {

        if (isUnavailable(worker.getId(), request.getDate())) {
            continue;
        }

        int assignedHours =
                calculateAssignedHours(worker.getId());

        int fairness =
                calculateFairness(
                        worker.getContractedHours(),
                        assignedHours
                );

        boolean recurring =
                worker.getId().equals(recurringWorkerId);

        ShiftRecommendationResponse response =
                buildRecommendationResponse(
                        worker,
                        fairness,
                        recurring
                );

        recommendations.add(response);
    }

    recommendations.sort(
            Comparator.comparing(
                    ShiftRecommendationResponse::getFairnessScore
            ).reversed()
    );

    if (recurringWorkerId != null) {

        for (int i = 0; i < recommendations.size(); i++) {

            if (recommendations.get(i).getUserId().equals(recurringWorkerId)) {

                ShiftRecommendationResponse recurring =
                        recommendations.remove(i);

                recommendations.add(0, recurring);

                break;
            }
        }
    }

    return recommendations;
}
private boolean isUnavailable(
        Long userId,
        LocalDate date
) {

    List<Unavailability> unavailabilityList =
            unavailabilityRepository.findByUserId(userId);

    for (Unavailability unavailability : unavailabilityList) {

        if (unavailability.getUnavailableDate().equals(date)) {
            return true;
        }
    }

    return false;
}

private int calculateFairness(
        int contractedHours,
        int assignedHours
) {

    return contractedHours - assignedHours;

}
private int calculateAssignedHours(Long userId) {

    List<WeeklyShiftAssignment> assignments =
            assignmentRepository.findAll();

    int assignedHours = 0;

    for (WeeklyShiftAssignment assignment : assignments) {

        if (!assignment.getAssignedUserId().equals(userId)) {
            continue;
        }

        Shift shift = assignment.getShiftTemplate();

        long hours = java.time.Duration
                .between(
                        shift.getStartTime(),
                        shift.getEndTime()
                )
                .toHours();

        assignedHours += hours;
    }

    return assignedHours;
}

private ShiftRecommendationResponse buildRecommendationResponse(
        UserResponse worker,
        int fairness,
        boolean recurring
) {

    ShiftRecommendationResponse response =
            new ShiftRecommendationResponse();

    response.setUserId(worker.getId());

    response.setWorkerName(worker.getName());

    response.setFairnessScore(fairness);

    response.setRecurringWorker(recurring);

    if (recurring) {

        response.setReason("Recurring worker");

    } else {

        response.setReason("Available worker");

    }

    return response;
}


private void validateNoShiftConflict(
        AssignWorkerRequest request,
        Shift newShift
) {

    List<WeeklyShiftAssignment> assignments =
            assignmentRepository.findByWeekStartDate(
                    request.getWeekStartDate()
            );

    for (WeeklyShiftAssignment assignment : assignments) {

        if (!assignment.getAssignedUserId()
                .equals(request.getUserId())) {
            continue;
        }

        if (!assignment.getDayOfWeek()
                .equals(request.getDayOfWeek())) {
            continue;
        }

        Shift existingShift =
                assignment.getShiftTemplate();

        boolean overlap =
                newShift.getStartTime()
                        .isBefore(existingShift.getEndTime())
                &&
                newShift.getEndTime()
                        .isAfter(existingShift.getStartTime());

        if (overlap) {
            throw new RuntimeException(
                    "Worker already has a conflicting shift."
            );
        }
    }
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
