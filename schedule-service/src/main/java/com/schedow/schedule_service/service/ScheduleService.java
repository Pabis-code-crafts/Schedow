package com.schedow.schedule_service.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.schedow.schedule_service.dto.CreateRecurringShiftAssignmentRequest;
import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateUnavailabilityRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.dto.ShiftRecommendationRequest;
import com.schedow.schedule_service.dto.ShiftRecommendationResponse;
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

private final RecurringShiftAssignmentRepository
        recurringAssignmentRepository;

public ScheduleService(
        ShiftRepository shiftRepository,
        WeeklyShiftAssignmentRepository assignmentRepository,
        UnavailabilityRepository unavailabilityRepository,
        RecurringShiftAssignmentRepository
                recurringAssignmentRepository
) {

    this.shiftRepository = shiftRepository;
    this.assignmentRepository = assignmentRepository;
    this.unavailabilityRepository =
            unavailabilityRepository;

    this.recurringAssignmentRepository =
            recurringAssignmentRepository;
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

public List<ShiftRecommendationResponse>
getRecommendations(
        ShiftRecommendationRequest request
) {

    List<ShiftRecommendationResponse>
            recommendations =
            new ArrayList<>();

    Shift targetShift =
            shiftRepository.findById(
                    request.getShiftId()
            ).orElseThrow(() ->
                    new RuntimeException(
                            "Shift not found"
                    ));

    DayOfWeek dayOfWeek =
            request.getDayOfWeek();

    LocalDate date =
            request.getDate();

    List<RecurringShiftAssignment>
            recurringAssignments =
            recurringAssignmentRepository
                    .findByDayOfWeek(
                            dayOfWeek
                    );

    for (RecurringShiftAssignment assignment
            : recurringAssignments) {

        Long userId =
                assignment.getUserId();

        System.out.println("Evaluating user: " + userId);

if (isUnavailable(userId, date)) {
    System.out.println("Rejected - unavailable");
    continue;
}

if (hasConflictingShift(userId, dayOfWeek, targetShift)) {
    System.out.println("Rejected - conflicting shift");
    continue;
}

        int score =
                calculateScore(userId);

        ShiftRecommendationResponse
                response =
                buildRecommendationResponse(
                        userId,
                        score
                );

        recommendations.add(response);
        System.out.println("Accepted with score: " + score);

    }

    recommendations.sort(
            (a, b) ->
                    b.getScore()
                            .compareTo(
                                    a.getScore()
                            )
    );

    

    return recommendations;
}

private boolean isUnavailable(
        Long userId,
        LocalDate date
) {

    List<Unavailability>
            unavailabilityList =
            unavailabilityRepository
                    .findByUserId(userId);

    for (Unavailability unavailability
            : unavailabilityList) {

        if (unavailability
                .getUnavailableDate()
                .equals(date)) {

            return true;
        }
    }

    return false;
}

private boolean hasConflictingShift(
        Long userId,
        DayOfWeek dayOfWeek,
        Shift currentShift
) {

    List<WeeklyShiftAssignment>
            assignments =
            assignmentRepository.findAll();

    for (WeeklyShiftAssignment existing
            : assignments) {

        if (!existing.getAssignedUserId()
                .equals(userId)) {

            continue;
        }

        if (!existing.getDayOfWeek()
                .equals(dayOfWeek)) {

            continue;
        }

        Shift existingShift =
                existing.getShiftTemplate();

        boolean overlap =
                currentShift.getStartTime()
                        .isBefore(
                                existingShift
                                        .getEndTime()
                        )

                        &&

                        currentShift.getEndTime()
                                .isAfter(
                                        existingShift
                                                .getStartTime()
                                );

        if (overlap) {

            return true;
        }
    }

    return false;
}

private int calculateScore(
        Long userId
) {

    int score = 100;

    List<WeeklyShiftAssignment>
            assignments =
            assignmentRepository.findAll();

    int totalAssignments = 0;

    int weekendAssignments = 0;

    int currentHours = 0;

    for (WeeklyShiftAssignment assignment
            : assignments) {

        if (!assignment
                .getAssignedUserId()
                .equals(userId)) {

            continue;
        }

        totalAssignments++;

        if (assignment.getDayOfWeek()
                == DayOfWeek.SATURDAY

                ||

                assignment.getDayOfWeek()
                        == DayOfWeek.SUNDAY) {

            weekendAssignments++;
        }

        Shift shift =
                assignment.getShiftTemplate();

        long hours =
                java.time.Duration
                        .between(
                                shift.getStartTime(),
                                shift.getEndTime()
                        )
                        .toHours();

        currentHours += hours;
    }

    score += 20;

    score -= (totalAssignments * 5);

    score -= (weekendAssignments * 10);

    int preferredHours =
            getPreferredHours(userId);

    if (currentHours
            < preferredHours) {

        score += 15;
    }

    return score;
}

private ShiftRecommendationResponse
buildRecommendationResponse(
        Long userId,
        int score
) {

    ShiftRecommendationResponse response =
            new ShiftRecommendationResponse();

    response.setUserId(userId);

    response.setScore(score);

    response.setReason(
            "Available recurring worker"
    );

    return response;
}

private int getPreferredHours(
        Long userId
) {

    if (userId == 1L) {
        return 20;
    }

    if (userId == 2L) {
        return 15;
    }

    if (userId == 3L) {
        return 10;
    }

    return 12;
}


}
