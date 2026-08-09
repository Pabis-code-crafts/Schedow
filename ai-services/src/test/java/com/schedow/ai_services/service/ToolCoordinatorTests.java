package com.schedow.ai_services.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.schedow.ai_services.dto.ActionProposal;
import com.schedow.ai_services.dto.AssignmentValidationRequest;
import com.schedow.ai_services.dto.AssignmentValidationResponse;
import com.schedow.ai_services.dto.ChatContext;
import com.schedow.ai_services.dto.ContextType;
import com.schedow.ai_services.dto.RecommendationResponse;
import com.schedow.ai_services.tool.DashboardTool;
import com.schedow.ai_services.tool.RecommendationTool;
import com.schedow.ai_services.tool.WeekScheduleTool;
import com.schedow.ai_services.tool.WorkerScheduleTool;

class ToolCoordinatorTests {

    private final RecommendationTool recommendationTool = mock(RecommendationTool.class);
    private final WeekScheduleTool weekScheduleTool = mock(WeekScheduleTool.class);
    private final WorkerScheduleTool workerScheduleTool = mock(WorkerScheduleTool.class);
    private final DashboardTool dashboardTool = mock(DashboardTool.class);
    private final ContextBuilder contextBuilder = new ContextBuilder();
    private final ToolCoordinator coordinator = new ToolCoordinator(
            recommendationTool,
            weekScheduleTool,
            workerScheduleTool,
            dashboardTool
    );

    @Test
    void recommendationIntentReturnsPendingAssignmentAction() {
        BuiltContext context = shiftContext();
        RecommendationResponse recommendation = recommendation(5L, "Tom");
        AssignmentValidationResponse valid = validation(true, "Assignment is valid.");

        when(recommendationTool.recommendWorker(
                eq(LocalDate.of(2026, 8, 7)),
                eq(LocalDate.of(2026, 8, 3)),
                eq(DayOfWeek.FRIDAY),
                eq(2L),
                isNull()
        )).thenReturn(List.of(recommendation));
        when(recommendationTool.validateAssignment(any(AssignmentValidationRequest.class)))
                .thenReturn(valid);

        CoordinatedToolContext result = coordinator.coordinate(
                AiIntent.RECOMMEND_WORKER,
                context,
                "Who should work this shift?"
        );

        ActionProposal action = result.getActionProposal();
        assertThat(action).isNotNull();
        assertThat(action.getType()).isEqualTo("ASSIGN_SHIFT");
        assertThat(action.getAction()).isEqualTo("ASSIGN_SHIFT");
        assertThat(action.getWorkerId()).isEqualTo(5L);
        assertThat(action.getWorkerName()).isEqualTo("Tom");
        assertThat(action.getShiftId()).isEqualTo(2L);
        assertThat(action.getShiftName()).isEqualTo("Afternoon Shift");
        assertThat(action.getDate()).isEqualTo(LocalDate.of(2026, 8, 7));
        assertThat(action.getDayOfWeek()).isEqualTo("FRIDAY");
        assertThat(action.getWeekStartDate()).isEqualTo(LocalDate.of(2026, 8, 3));
        assertThat(action.getStartTime()).isEqualTo("12:00");
        assertThat(action.getEndTime()).isEqualTo("16:30");
    }

    @Test
    void generalChatDoesNotReturnPendingAction() {
        CoordinatedToolContext result = coordinator.coordinate(
                AiIntent.GENERAL_CHAT,
                shiftContext(),
                "Thanks"
        );

        assertThat(result.getActionProposal()).isNull();
        verify(recommendationTool, never()).recommendWorker(any(), any(), any(), any(), any());
    }

    @Test
    void invalidRecommendationIsNotApprovable() {
        BuiltContext context = shiftContext();
        RecommendationResponse recommendation = recommendation(5L, "Tom");
        AssignmentValidationResponse invalid = validation(false, "Worker already has a conflicting shift.");

        when(recommendationTool.recommendWorker(any(), any(), any(), any(), any()))
                .thenReturn(List.of(recommendation));
        when(recommendationTool.validateAssignment(any(AssignmentValidationRequest.class)))
                .thenReturn(invalid);

        CoordinatedToolContext result = coordinator.coordinate(
                AiIntent.RECOMMEND_WORKER,
                context,
                "Recommend a worker"
        );

        assertThat(result.getActionProposal()).isNull();
    }

    private BuiltContext shiftContext() {
        ChatContext context = new ChatContext();
        context.setContextType(ContextType.SHIFT);
        context.setWeekStartDate(LocalDate.of(2026, 8, 3));
        context.setDate(LocalDate.of(2026, 8, 7));
        context.setDayOfWeek(DayOfWeek.FRIDAY);
        context.setShiftId(2L);
        context.setShiftName("Afternoon Shift");
        context.setStartTime("12:00");
        context.setEndTime("16:30");
        return contextBuilder.build(context);
    }

    private RecommendationResponse recommendation(Long userId, String workerName) {
        RecommendationResponse response = new RecommendationResponse();
        response.setUserId(userId);
        response.setWorkerName(workerName);
        response.setReason(workerName + " is available and has no conflicting shift.");
        return response;
    }

    private AssignmentValidationResponse validation(boolean valid, String reason) {
        AssignmentValidationResponse response = new AssignmentValidationResponse();
        response.setValid(valid);
        response.setReason(reason);
        return response;
    }
}
