package com.schedow.schedule_service.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.schedow.schedule_service.dto.CreateRecurringShiftAssignmentRequest;
import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateUnavailabilityRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.entity.RecurringShiftAssignment;
import com.schedow.schedule_service.entity.Shift;
import com.schedow.schedule_service.entity.Unavailability;
import com.schedow.schedule_service.entity.WeeklyShiftAssignment;
import com.schedow.schedule_service.repository.RecurringShiftAssignmentRepository;
import com.schedow.schedule_service.service.ScheduleService;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

private final ScheduleService scheduleService;
private final RecurringShiftAssignmentRepository recurringAssignmentRepository;

public ScheduleController(ScheduleService scheduleService, RecurringShiftAssignmentRepository recurringAssignmentRepository) {
    this.scheduleService = scheduleService;
    this.recurringAssignmentRepository = recurringAssignmentRepository;
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





}
