package com.schedow.ai_services.tool;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.schedow.ai_services.client.ScheduleClient;
import com.schedow.ai_services.dto.WeekScheduleResponse;
import com.schedow.ai_services.dto.WeekScheduleSummary;

class WeekScheduleToolTests {

    private final WeekScheduleTool tool = new WeekScheduleTool(mock(ScheduleClient.class));

    @Test
    void buildsUnfilledSlotsFromFullSelectedWeekGrid() {
        LocalDate weekStartDate = LocalDate.of(2026, 8, 3);
        WeekScheduleResponse.ShiftTemplate morning = shiftTemplate(1L, "Morning Shift", "06:00", "09:30");
        WeekScheduleResponse.ShiftTemplate afternoon = shiftTemplate(2L, "Afternoon Shift", "12:00", "16:30");
        WeekScheduleResponse assignedTuesdayAfternoon = assignment(
                99L,
                "TUESDAY",
                5L,
                afternoon
        );

        WeekScheduleSummary summary = tool.buildWeekScheduleSummary(
                weekStartDate,
                List.of(morning, afternoon),
                List.of(assignedTuesdayAfternoon)
        );

        assertThat(summary.getTotalShiftSlots()).isEqualTo(14);
        assertThat(summary.getAssignedShiftSlots()).isEqualTo(1);
        assertThat(summary.getUnfilledShiftSlots()).isEqualTo(13);
        assertThat(summary.getAssignedSlots())
                .extracting(slot -> slot.getDayOfWeek().name() + ":" + slot.getShiftName())
                .containsExactly("TUESDAY:Afternoon Shift");
        assertThat(summary.getUnfilledSlots())
                .extracting(slot -> slot.getDayOfWeek().name() + ":" + slot.getShiftName())
                .contains("MONDAY:Morning Shift", "MONDAY:Afternoon Shift", "TUESDAY:Morning Shift")
                .doesNotContain("TUESDAY:Afternoon Shift");
    }

    private WeekScheduleResponse.ShiftTemplate shiftTemplate(
            Long id,
            String name,
            String startTime,
            String endTime
    ) {
        WeekScheduleResponse.ShiftTemplate template = new WeekScheduleResponse.ShiftTemplate();
        template.setId(id);
        template.setName(name);
        template.setStartTime(LocalTime.parse(startTime));
        template.setEndTime(LocalTime.parse(endTime));
        return template;
    }

    private WeekScheduleResponse assignment(
            Long id,
            String dayOfWeek,
            Long assignedUserId,
            WeekScheduleResponse.ShiftTemplate template
    ) {
        WeekScheduleResponse assignment = new WeekScheduleResponse();
        assignment.setId(id);
        assignment.setWeekStartDate(LocalDate.of(2026, 8, 3));
        assignment.setDayOfWeek(dayOfWeek);
        assignment.setAssignedUserId(assignedUserId);
        assignment.setShiftTemplate(template);
        return assignment;
    }
}
