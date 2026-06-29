package com.schedow.schedule_service.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schedow.schedule_service.dto.CreateRecurringShiftAssignmentRequest;
import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateUnavailabilityRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.dto.ShiftRecommendationRequest;
import com.schedow.schedule_service.dto.ShiftRecommendationResponse;
import com.schedow.schedule_service.dto.UserResponse;
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

    assignment.setShiftTemplate(shift);

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




}
