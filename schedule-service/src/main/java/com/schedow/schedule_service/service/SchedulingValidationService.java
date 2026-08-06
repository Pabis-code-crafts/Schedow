package com.schedow.schedule_service.service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.entity.Shift;
import com.schedow.schedule_service.entity.WeeklyShiftAssignment;
import com.schedow.schedule_service.exception.SchedulingConflictException;
import com.schedow.schedule_service.repository.WeeklyShiftAssignmentRepository;

@Service
public class SchedulingValidationService {

    private final WeeklyShiftAssignmentRepository assignmentRepository;
    private final WorkerProvider workerProvider;

    public SchedulingValidationService(
            WeeklyShiftAssignmentRepository assignmentRepository,
            WorkerProvider workerProvider
    ) {
        this.assignmentRepository = assignmentRepository;
        this.workerProvider = workerProvider;
    }

    public void validateAssignment(
            CreateWeeklyShiftAssignmentRequest request,
            Shift shift
    ) {

        validateDuplicateAssignment(request);

        validateNoShiftConflict(
                request,
                shift
        );

        validateContractedHours(
                request,
                shift
        );
    }

    private void validateDuplicateAssignment(
            CreateWeeklyShiftAssignmentRequest request
    ) {

        boolean exists = assignmentRepository
                .findByWeekStartDateAndDayOfWeekAndShiftTemplateId(
                        request.getWeekStartDate(),
                        request.getDayOfWeek(),
                        request.getShiftId()
                )
                .isPresent();

        if (exists) {
            throw new SchedulingConflictException(
        "Shift already assigned."
);
        }
    }

    private void validateNoShiftConflict(
            CreateWeeklyShiftAssignmentRequest request,
            Shift newShift
    ) {

        List<WeeklyShiftAssignment> assignments =
                assignmentRepository.findByWeekStartDate(
                        request.getWeekStartDate()
                );

        for (WeeklyShiftAssignment assignment : assignments) {

            if (assignment.getAssignedUserId() == null
                    || assignment.getDayOfWeek() == null
                    || assignment.getShiftTemplate() == null) {
                continue;
            }

            if (!assignment.getAssignedUserId()
                    .equals(request.getAssignedUserId())) {
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
                throw new SchedulingConflictException(
        "Worker already has a conflicting shift."
);
            }
        }
    }

    private void validateContractedHours(
        CreateWeeklyShiftAssignmentRequest request,
        Shift newShift
) {

    System.out.println("========== CONTRACTED HOURS ==========");
    System.out.println("Request User ID: " + request.getAssignedUserId());

    var worker = workerProvider.getWorkers()
            .stream()
            .filter(w -> w.getId().equals(request.getAssignedUserId()))
            .findFirst()
            .orElseThrow(() ->
                    new RuntimeException("Worker not found"));

    System.out.println("Worker Name: " + worker.getName());
    System.out.println("Contracted Hours: " + worker.getContractedHours());

    List<WeeklyShiftAssignment> assignments =
        assignmentRepository.findByAssignedUserIdAndWeekStartDate(
                request.getAssignedUserId(),
                request.getWeekStartDate()
        );

    System.out.println("Assignments found: " + assignments.size());
int assignedHours =
        calculateAssignedHours(
                request.getAssignedUserId(),
                request.getWeekStartDate()
        );

    int newShiftHours = (int) Duration
            .between(
                    newShift.getStartTime(),
                    newShift.getEndTime()
            )
            .toHours();

    int totalHours = assignedHours + newShiftHours;

    System.out.println("--------------------------------");
    System.out.println("Already Assigned: " + assignedHours);
    System.out.println("New Shift Hours: " + newShiftHours);
    System.out.println("Total Hours: " + totalHours);
    System.out.println("Contracted Limit: " + worker.getContractedHours());
    System.out.println("================================");

    if (totalHours > worker.getContractedHours()) {
        throw new SchedulingConflictException(
        "Assignment exceeds contracted hours."
);
    }
}
private int calculateAssignedHours(
        Long userId,
        LocalDate weekStartDate
) {

    List<WeeklyShiftAssignment> assignments =
            assignmentRepository.findByAssignedUserIdAndWeekStartDate(
                    userId,
                    weekStartDate
            );

    int total = 0;

    for (WeeklyShiftAssignment assignment : assignments) {

        if (assignment.getShiftTemplate() == null) {
            continue;
        }

        Shift shift = assignment.getShiftTemplate();

        total += Duration
                .between(
                        shift.getStartTime(),
                        shift.getEndTime()
                )
                .toHours();
    }

    return total;
}
}