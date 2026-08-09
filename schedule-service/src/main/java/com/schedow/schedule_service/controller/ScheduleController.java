package com.schedow.schedule_service.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.schedow.schedule_service.dto.AssignmentValidationRequest;
import com.schedow.schedule_service.dto.AssignmentValidationResponse;
import com.schedow.schedule_service.dto.CreateRecurringShiftAssignmentRequest;
import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateUnavailabilityRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.dto.DashboardResponse;
import com.schedow.schedule_service.dto.ShiftRecommendationRequest;
import com.schedow.schedule_service.dto.ShiftRecommendationResponse;
import com.schedow.schedule_service.dto.UpdateAssignmentWorkerRequest;
import com.schedow.schedule_service.dto.WeekScheduleResponse;
import com.schedow.schedule_service.dto.WorkerScheduleResponse;
import com.schedow.schedule_service.entity.RecurringShiftAssignment;
import com.schedow.schedule_service.entity.Shift;
import com.schedow.schedule_service.entity.Unavailability;
import com.schedow.schedule_service.entity.WeeklyShiftAssignment;
import com.schedow.schedule_service.repository.RecurringShiftAssignmentRepository;
import com.schedow.schedule_service.service.RecommendationService;
import com.schedow.schedule_service.service.ScheduleService;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

private final ScheduleService scheduleService;
private final RecurringShiftAssignmentRepository recurringAssignmentRepository;
private final RecommendationService recommendationService;

public ScheduleController(
        ScheduleService scheduleService,
        RecurringShiftAssignmentRepository recurringAssignmentRepository,
        RecommendationService recommendationService
) {
    this.scheduleService = scheduleService;
    this.recurringAssignmentRepository = recurringAssignmentRepository;
    this.recommendationService = recommendationService;
}

@PostMapping("/shifts")
public Shift createShift(
        @RequestBody CreateShiftRequest request
) {
    return scheduleService.createShift(request);
}

@PostMapping("/assignments")
public WeeklyShiftAssignment createAssignment(
        @RequestBody CreateWeeklyShiftAssignmentRequest request
) {
    return scheduleService.createAssignment(request);
}

@GetMapping("/assignments/week/{weekStartDate}")
public List<WeeklyShiftAssignment> getAssignmentsByWeek(
@PathVariable LocalDate weekStartDate
) {
return scheduleService
.getAssignmentsByWeek(weekStartDate);
}

@PostMapping("/unavailability")
public Unavailability createUnavailability(
@RequestBody CreateUnavailabilityRequest request
) {

return scheduleService
        .createUnavailability(request);


}

@GetMapping("/unavailability/user/{userId}")
public List<Unavailability> getUserUnavailability(@PathVariable Long userId) 
{
return scheduleService.getUserUnavailability(userId);
}

@PostMapping("/recurring-assignments")
public RecurringShiftAssignment
createRecurringAssignment(
@RequestBody
CreateRecurringShiftAssignmentRequest request
) {


return scheduleService
        .createRecurringAssignment(request);


}

// @PostMapping("/assign-worker")
// public AssignWorkerResponse assignWorker(
//         @RequestBody AssignWorkerRequest request
// ) {

//     return scheduleService.assignWorker(request);

// }
@GetMapping("/week/{weekStartDate}")
public List<WeekScheduleResponse> getWeekSchedule(
        @PathVariable LocalDate weekStartDate
) {

    return scheduleService.getWeekSchedule(
            weekStartDate
    );
}

@GetMapping("/workers/{userId}")
public List<WorkerScheduleResponse> getWorkerSchedule(
        @PathVariable Long userId,
        @RequestParam(required = false) LocalDate weekStartDate
) {

    return scheduleService.getWorkerSchedule(
            userId,
            weekStartDate
    );
}

@PostMapping("/assignments/validate")
public AssignmentValidationResponse validateAssignment(
        @RequestBody AssignmentValidationRequest request
) {

    return scheduleService.validateAssignment(request);
}

@GetMapping("/dashboard")
public DashboardResponse getDashboard() {

    return scheduleService.getDashboard();
}


@GetMapping("/recurring-assignments/user/{userId}")
public List<RecurringShiftAssignment>
getRecurringAssignments(
@PathVariable Long userId
) {

return scheduleService
        .getRecurringAssignments(userId);

}

@GetMapping("/shifts")
public List<Shift> getAllShifts() {

return scheduleService.getAllShifts();


}


// @GetMapping("/recommendations")
// public List<ShiftRecommendationResponse>
// getRecommendations() {


// return scheduleService
//         .getRecommendations();


// }


@PostMapping("/recommendations")
public List<ShiftRecommendationResponse> getRecommendations(
        @RequestBody ShiftRecommendationRequest request
) {
    return recommendationService.getRecommendations(request);
}
@DeleteMapping("/assignments/{assignmentId}")
public void deleteAssignment(
        @PathVariable Long assignmentId
) {

    scheduleService.deleteAssignment(
            assignmentId
    );

}
@PatchMapping("/assignments/{assignmentId}/worker")
public WeeklyShiftAssignment updateAssignedWorker(
        @PathVariable Long assignmentId,
        @RequestBody UpdateAssignmentWorkerRequest request
) {

    return scheduleService.updateAssignedWorker(
            assignmentId,
            request
    );
}
}
