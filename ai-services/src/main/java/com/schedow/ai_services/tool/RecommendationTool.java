package com.schedow.ai_services.tool;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import com.schedow.ai_services.client.ScheduleClient;
import com.schedow.ai_services.dto.AssignmentValidationRequest;
import com.schedow.ai_services.dto.AssignmentValidationResponse;
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

        @ToolParam(description = "Week start date")
        LocalDate weekStartDate,

        @ToolParam(description = "Day of week")
        DayOfWeek dayOfWeek,

        @ToolParam(description = "Shift ID")
        Long shiftId,

        @ToolParam(description = "Existing assignment ID when this shift is already assigned")
        Long assignmentId
) {

    System.out.println(">>> Recommendation Tool Called <<<");

    RecommendationRequest request = new RecommendationRequest();

    request.setDate(date);
    request.setWeekStartDate(weekStartDate);
    request.setDayOfWeek(dayOfWeek);
    request.setShiftId(shiftId);
    request.setAssignmentId(assignmentId);

    return scheduleClient.recommend(request);
}

public AssignmentValidationResponse validateAssignment(AssignmentValidationRequest request) {
    return scheduleClient.validateAssignment(request);
}
}
