package com.schedow.ai_services.tool;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import com.schedow.ai_services.client.ScheduleClient;
import com.schedow.ai_services.dto.RecommendationRequest;
import com.schedow.ai_services.dto.RecommendationResponse;

@Component
public class RecommendationTool {

    private final ScheduleClient scheduleClient;

    public RecommendationTool(
            ScheduleClient scheduleClient
    ) {

        this.scheduleClient = scheduleClient;

    }
@Tool(description = "Recommend workers for a shift")
public List<RecommendationResponse> recommendWorker(
        @ToolParam(description = "Date of the shift")
        LocalDate date,

        @ToolParam(description = "Day of week")
        DayOfWeek dayOfWeek,

        @ToolParam(description = "Shift ID")
        Long shiftId
) {

    System.out.println(">>> Recommendation Tool Called <<<");

    RecommendationRequest request = new RecommendationRequest();

    request.setDate(date);
    request.setDayOfWeek(dayOfWeek);
    request.setShiftId(shiftId);

    return scheduleClient.recommend(request);
}
}