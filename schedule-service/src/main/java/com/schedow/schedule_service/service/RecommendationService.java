package com.schedow.schedule_service.service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

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
public class RecommendationService {

    private final WorkerProvider workerProvider;
private final SchedulingValidationService schedulingValidationService;
private final ShiftRepository shiftRepository;
private final WeeklyShiftAssignmentRepository assignmentRepository;
private final UnavailabilityRepository unavailabilityRepository;
private final RecurringShiftAssignmentRepository recurringAssignmentRepository;

public RecommendationService(
        WorkerProvider workerProvider,
        SchedulingValidationService schedulingValidationService,
        ShiftRepository shiftRepository,
        WeeklyShiftAssignmentRepository assignmentRepository,
        UnavailabilityRepository unavailabilityRepository,
        RecurringShiftAssignmentRepository recurringAssignmentRepository
) {
    this.workerProvider = workerProvider;
    this.schedulingValidationService = schedulingValidationService;
    this.shiftRepository = shiftRepository;
    this.assignmentRepository = assignmentRepository;
    this.unavailabilityRepository = unavailabilityRepository;
    this.recurringAssignmentRepository = recurringAssignmentRepository;
}
    
public List<ShiftRecommendationResponse> getRecommendations(
        ShiftRecommendationRequest request
) {

    Shift shift = shiftRepository.findById(request.getShiftId())
            .orElseThrow(() -> new RuntimeException("Shift not found"));

    LocalDate weekStartDate = resolveWeekStartDate(request);

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

        if (!isValidCandidate(worker.getId(), request, weekStartDate, shift)) {
            continue;
        }

        int assignedHours =
                calculateAssignedHours(worker.getId(), weekStartDate);

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
private int calculateAssignedHours(Long userId, LocalDate weekStartDate) {

    List<WeeklyShiftAssignment> assignments =
            assignmentRepository.findByAssignedUserIdAndWeekStartDate(
                    userId,
                    weekStartDate
            );

    int assignedHours = 0;

    for (WeeklyShiftAssignment assignment : assignments) {

        if (assignment.getAssignedUserId() == null
                || assignment.getShiftTemplate() == null) {
            continue;
        }

        Shift shift = assignment.getShiftTemplate();

        assignedHours += java.time.Duration
                .between(
                        shift.getStartTime(),
                        shift.getEndTime()
                )
                .toHours();
    }

    return assignedHours;
}

private int calculateFairness(
        int contractedHours,
        int assignedHours
) {

    return contractedHours - assignedHours;

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

    response.setReason(
            worker.getName() + " is available for this shift, has no conflicting assignment, "
                    + "remains within contracted hours for the selected week, and is the recurring worker."
    );

    } else {

        response.setReason(
                worker.getName() + " is available for this shift, has no conflicting assignment, "
                        + "and remains within contracted hours for the selected week."
        );

    }

    return response;
}

private LocalDate resolveWeekStartDate(ShiftRecommendationRequest request) {
    if (request.getWeekStartDate() != null) {
        return request.getWeekStartDate();
    }

    return request.getDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
}

private boolean isValidCandidate(
        Long userId,
        ShiftRecommendationRequest source,
        LocalDate weekStartDate,
        Shift shift
) {
    CreateWeeklyShiftAssignmentRequest validation =
            new CreateWeeklyShiftAssignmentRequest();

    validation.setWeekStartDate(weekStartDate);
    validation.setDayOfWeek(source.getDayOfWeek());
    validation.setAssignedUserId(userId);
    validation.setShiftId(source.getShiftId());

    try {
        if (source.getAssignmentId() == null) {
            schedulingValidationService.validateAssignment(validation, shift);
        } else {
            schedulingValidationService.validateAssignmentForUpdate(
                    source.getAssignmentId(),
                    validation,
                    shift
            );
        }

        return true;
    } catch (RuntimeException exception) {
        return false;
    }
}
}
