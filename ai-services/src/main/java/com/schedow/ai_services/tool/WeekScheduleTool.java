package com.schedow.ai_services.tool;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import com.schedow.ai_services.client.ScheduleClient;
import com.schedow.ai_services.dto.WeekScheduleResponse;
import com.schedow.ai_services.dto.WeekScheduleSummary;

@Component
public class WeekScheduleTool {

    private final ScheduleClient scheduleClient;

    public WeekScheduleTool(ScheduleClient scheduleClient) {
        this.scheduleClient = scheduleClient;
    }

    @Tool(description = "Get the weekly shift schedule, including assigned and unfilled shift slots for the selected week")
    public WeekScheduleSummary getWeekSchedule(

            @ToolParam(description = "Week start date")
            LocalDate weekStartDate

    ) {

        List<WeekScheduleResponse.ShiftTemplate> shiftTemplates = scheduleClient.getShiftTemplates();
        List<WeekScheduleResponse> assignments = scheduleClient.getWeekSchedule(weekStartDate);
        return buildWeekScheduleSummary(weekStartDate, shiftTemplates, assignments);

    }

    WeekScheduleSummary buildWeekScheduleSummary(
            LocalDate weekStartDate,
            List<WeekScheduleResponse.ShiftTemplate> shiftTemplates,
            List<WeekScheduleResponse> assignments
    ) {
        WeekScheduleSummary summary = new WeekScheduleSummary();
        summary.setWeekStartDate(weekStartDate);

        Map<String, WeekScheduleResponse> assignmentByCell = new HashMap<>();
        if (assignments != null) {
            for (WeekScheduleResponse assignment : assignments) {
                if (assignment.getDayOfWeek() == null
                        || assignment.getShiftTemplate() == null
                        || assignment.getShiftTemplate().getId() == null) {
                    continue;
                }

                assignmentByCell.put(
                        cellKey(assignment.getDayOfWeek(), assignment.getShiftTemplate().getId()),
                        assignment
                );
            }
        }

        List<WeekScheduleResponse.ShiftTemplate> templates = shiftTemplates == null
                ? List.of()
                : shiftTemplates.stream()
                        .filter(template -> template.getId() != null)
                        .sorted(Comparator.comparing(
                                WeekScheduleResponse.ShiftTemplate::getStartTime,
                                Comparator.nullsLast(Comparator.naturalOrder())
                        ).thenComparing(
                                WeekScheduleResponse.ShiftTemplate::getName,
                                Comparator.nullsLast(String::compareToIgnoreCase)
                        ))
                        .toList();

        for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
            LocalDate date = weekStartDate.plusDays(dayOffset);
            DayOfWeek dayOfWeek = date.getDayOfWeek();

            for (WeekScheduleResponse.ShiftTemplate template : templates) {
                WeekScheduleResponse assignment = assignmentByCell.get(cellKey(dayOfWeek.name(), template.getId()));
                WeekScheduleSummary.ShiftSlot slot = buildSlot(date, dayOfWeek, template, assignment);

                if (assignment == null) {
                    summary.getUnfilledSlots().add(slot);
                } else {
                    summary.getAssignedSlots().add(slot);
                }
            }
        }

        summary.setAssignedShiftSlots(summary.getAssignedSlots().size());
        summary.setUnfilledShiftSlots(summary.getUnfilledSlots().size());
        summary.setTotalShiftSlots(summary.getAssignedShiftSlots() + summary.getUnfilledShiftSlots());

        return summary;
    }

    private WeekScheduleSummary.ShiftSlot buildSlot(
            LocalDate date,
            DayOfWeek dayOfWeek,
            WeekScheduleResponse.ShiftTemplate template,
            WeekScheduleResponse assignment
    ) {
        WeekScheduleSummary.ShiftSlot slot = new WeekScheduleSummary.ShiftSlot();
        slot.setDate(date);
        slot.setDayOfWeek(dayOfWeek);
        slot.setShiftId(template.getId());
        slot.setShiftName(template.getName());
        slot.setStartTime(template.getStartTime());
        slot.setEndTime(template.getEndTime());

        if (assignment != null) {
            slot.setAssignmentId(assignment.getId());
            slot.setWorkerId(assignment.getAssignedUserId());
        }

        return slot;
    }

    private String cellKey(String dayOfWeek, Long shiftId) {
        return dayOfWeek + ":" + shiftId;
    }
}
