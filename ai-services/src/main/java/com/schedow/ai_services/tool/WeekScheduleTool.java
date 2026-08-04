package com.schedow.ai_services.tool;

import java.time.LocalDate;
import java.util.List;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import com.schedow.ai_services.client.ScheduleClient;
import com.schedow.ai_services.dto.WeekScheduleResponse;

@Component
public class WeekScheduleTool {

    private final ScheduleClient scheduleClient;

    public WeekScheduleTool(ScheduleClient scheduleClient) {
        this.scheduleClient = scheduleClient;
    }

    @Tool(description = "Get the weekly shift schedule")
    public List<WeekScheduleResponse> getWeekSchedule(

            @ToolParam(description = "Week start date")
            LocalDate weekStartDate

    ) {

        return scheduleClient.getWeekSchedule(weekStartDate);

    }

}