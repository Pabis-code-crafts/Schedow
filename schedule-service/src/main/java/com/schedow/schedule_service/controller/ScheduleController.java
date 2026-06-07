package com.schedow.schedule_service.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.schedow.schedule_service.dto.CreateShiftRequest;
import com.schedow.schedule_service.dto.CreateWeeklyShiftAssignmentRequest;
import com.schedow.schedule_service.entity.Shift;
import com.schedow.schedule_service.entity.WeeklyShiftAssignment;
import com.schedow.schedule_service.service.ScheduleService;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

private final ScheduleService scheduleService;

public ScheduleController(ScheduleService scheduleService) {
    this.scheduleService = scheduleService;
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


}
