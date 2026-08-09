package com.schedow.ai_services.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.schedow.ai_services.dto.ActionProposal;
import com.schedow.ai_services.dto.AssignmentValidationRequest;
import com.schedow.ai_services.dto.AssignmentValidationResponse;
import com.schedow.ai_services.dto.RecommendationResponse;
import com.schedow.ai_services.dto.WeekScheduleSummary;
import com.schedow.ai_services.tool.DashboardTool;
import com.schedow.ai_services.tool.RecommendationTool;
import com.schedow.ai_services.tool.WeekScheduleTool;
import com.schedow.ai_services.tool.WorkerScheduleTool;

@Component
public class ToolCoordinator {

    private final RecommendationTool recommendationTool;
    private final WeekScheduleTool weekScheduleTool;
    private final WorkerScheduleTool workerScheduleTool;
    private final DashboardTool dashboardTool;

    public ToolCoordinator(
            RecommendationTool recommendationTool,
            WeekScheduleTool weekScheduleTool,
            WorkerScheduleTool workerScheduleTool,
            DashboardTool dashboardTool
    ) {
        this.recommendationTool = recommendationTool;
        this.weekScheduleTool = weekScheduleTool;
        this.workerScheduleTool = workerScheduleTool;
        this.dashboardTool = dashboardTool;
    }

    public CoordinatedToolContext coordinate(AiIntent intent, BuiltContext context, String message) {
        List<ToolResult> results = new ArrayList<>();

        switch (intent) {
            case RECOMMEND_WORKER, FIND_AVAILABLE_WORKERS -> addRecommendation(results, context);
            case EXPLAIN_ASSIGNMENT -> {
                addScopedWeekSchedule(results, context);
                if (context.isShiftUnassigned()) {
                    results.add(ToolResult.success(
                            "assignmentState",
                            Map.of("state", "unassigned", "message", "There is no current assignment for this shift.")
                    ));
                    addRecommendation(results, context);
                } else {
                    addRecommendation(results, context);
                    addWorkerSchedule(results, context);
                }
            }
            case SHOW_WEEK -> addWeekSchedule(results, context);
            case SHOW_DAY, SHOW_SHIFT, CHECK_STAFFING -> addScopedWeekSchedule(results, context);
            case SHOW_WORKER -> addWorkerSchedule(results, context);
            case DASHBOARD_SUMMARY -> addDashboard(results);
            case COMPARE_WORKERS -> {
                addRecommendation(results, context);
                addWorkerSchedule(results, context);
            }
            case ASSIGN_WORKER -> addRecommendation(results, context);
            case GENERAL_CHAT -> {
            }
        }

        ActionProposal actionProposal = shouldReturnAssignmentProposal(intent)
                ? buildAssignmentProposal(results, context, message)
                : null;

        return new CoordinatedToolContext(results, actionProposal);
    }

    private boolean shouldReturnAssignmentProposal(AiIntent intent) {
        return intent == AiIntent.RECOMMEND_WORKER || intent == AiIntent.ASSIGN_WORKER;
    }

    private void addRecommendation(List<ToolResult> results, BuiltContext context) {
        if (!context.hasShiftTarget()) {
            return;
        }

        try {
            results.add(ToolResult.success(
                    "recommendations",
                    recommendationTool.recommendWorker(
                            context.getDate(),
                            context.getWeekStartDate(),
                            context.getDayOfWeek(),
                            context.getShiftId(),
                            context.getAssignmentId()
                    )
            ));
        } catch (Exception exception) {
            results.add(ToolResult.failure("recommendations", exception));
        }
    }

    private void addWeekSchedule(List<ToolResult> results, BuiltContext context) {
        if (!context.hasWeekTarget()) {
            return;
        }

        try {
            results.add(ToolResult.success("weekSchedule", weekScheduleTool.getWeekSchedule(context.getWeekStartDate())));
        } catch (Exception exception) {
            results.add(ToolResult.failure("weekSchedule", exception));
        }
    }

    private void addScopedWeekSchedule(List<ToolResult> results, BuiltContext context) {
        if (!context.hasWeekTarget()) {
            return;
        }

        try {
            WeekScheduleSummary schedule = weekScheduleTool.getWeekSchedule(context.getWeekStartDate());
            results.add(ToolResult.success("scheduleContext", filterSchedule(schedule, context)));
        } catch (Exception exception) {
            results.add(ToolResult.failure("scheduleContext", exception));
        }
    }

    private void addWorkerSchedule(List<ToolResult> results, BuiltContext context) {
        if (!context.hasWorkerTarget()) {
            return;
        }

        try {
            results.add(ToolResult.success(
                    "workerSchedule",
                    workerScheduleTool.getWorkerSchedule(context.getAssignedWorkerId(), context.getWeekStartDate())
            ));
        } catch (Exception exception) {
            results.add(ToolResult.failure("workerSchedule", exception));
        }
    }

    private void addDashboard(List<ToolResult> results) {
        try {
            results.add(ToolResult.success("dashboard", dashboardTool.getDashboard()));
        } catch (Exception exception) {
            results.add(ToolResult.failure("dashboard", exception));
        }
    }

    @SuppressWarnings("unchecked")
    private ActionProposal buildAssignmentProposal(List<ToolResult> results, BuiltContext context, String message) {
        if (!context.hasShiftTarget()) {
            return null;
        }

        RecommendationResponse selected = null;
        for (ToolResult result : results) {
            if (!"recommendations".equals(result.getName()) || !(result.getData() instanceof List<?> recommendations)) {
                continue;
            }

            selected = selectRequestedWorker((List<RecommendationResponse>) recommendations, message);
        }

        if (selected == null) {
            results.add(ToolResult.success(
                    "workerResolution",
                    Map.of("resolved", false, "message", "The requested worker was not found in the validated candidates.")
            ));
            return null;
        }

        AssignmentValidationResponse validation = validateSelectedWorker(results, context, selected);
        if (validation == null || !validation.isValid()) {
            String reason = validation == null
                    ? "The assignment could not be validated by the scheduling service."
                    : validation.getReason();
            results.add(ToolResult.success(
                    "assignmentValidation",
                    Map.of("valid", false, "reason", reason == null ? "Assignment is not valid." : reason)
            ));
            return null;
        }

        ActionProposal proposal = new ActionProposal();
        proposal.setType("ASSIGN_SHIFT");
        proposal.setAction("ASSIGN_SHIFT");
        proposal.setWorkerId(selected.getUserId());
        proposal.setWorkerName(selected.getWorkerName());
        proposal.setShiftId(context.getShiftId());
        proposal.setAssignmentId(context.getAssignmentId());
        proposal.setShiftName(context.getShiftName());
        proposal.setDate(context.getDate());
        proposal.setDayOfWeek(context.getDayOfWeek().name());
        proposal.setWeekStartDate(context.getWeekStartDate());
        proposal.setStartTime(context.getStartTime());
        proposal.setEndTime(context.getEndTime());
        proposal.setReason(explainRecommendation(selected));

        return proposal;
    }

    private WeekScheduleSummary filterSchedule(WeekScheduleSummary schedule, BuiltContext context) {
        if (schedule == null) {
            return null;
        }

        WeekScheduleSummary filtered = new WeekScheduleSummary();
        filtered.setWeekStartDate(schedule.getWeekStartDate());
        filtered.setAssignedSlots(filterSlots(schedule.getAssignedSlots(), context));
        filtered.setUnfilledSlots(filterSlots(schedule.getUnfilledSlots(), context));
        filtered.setAssignedShiftSlots(filtered.getAssignedSlots().size());
        filtered.setUnfilledShiftSlots(filtered.getUnfilledSlots().size());
        filtered.setTotalShiftSlots(filtered.getAssignedShiftSlots() + filtered.getUnfilledShiftSlots());
        return filtered;
    }

    private List<WeekScheduleSummary.ShiftSlot> filterSlots(
            List<WeekScheduleSummary.ShiftSlot> slots,
            BuiltContext context
    ) {
        if (slots == null) {
            return List.of();
        }

        return slots.stream()
                .filter(item -> context.getDayOfWeek() == null
                        || context.getDayOfWeek().equals(item.getDayOfWeek()))
                .filter(item -> context.getShiftId() == null
                        || context.getShiftId().equals(item.getShiftId()))
                .toList();
    }

    private AssignmentValidationResponse validateSelectedWorker(
            List<ToolResult> results,
            BuiltContext context,
            RecommendationResponse selected
    ) {
        AssignmentValidationRequest request = new AssignmentValidationRequest();
        request.setWeekStartDate(context.getWeekStartDate());
        request.setDayOfWeek(context.getDayOfWeek());
        request.setShiftId(context.getShiftId());
        request.setAssignedUserId(selected.getUserId());
        request.setAssignmentId(context.getAssignmentId());

        try {
            AssignmentValidationResponse validation = recommendationTool.validateAssignment(request);
            results.add(ToolResult.success("assignmentValidation", validation));
            return validation;
        } catch (Exception exception) {
            results.add(ToolResult.failure("assignmentValidation", exception));
            return null;
        }
    }

    private RecommendationResponse selectRequestedWorker(List<RecommendationResponse> recommendations, String message) {
        if (recommendations == null || recommendations.isEmpty()) {
            return null;
        }

        String normalizedMessage = message == null ? "" : message.toLowerCase(Locale.ROOT);
        for (RecommendationResponse recommendation : recommendations) {
            String workerName = recommendation.getWorkerName();
            if (workerName != null && normalizedMessage.contains(workerName.toLowerCase(Locale.ROOT))) {
                return recommendation;
            }
        }

        if (looksLikeNamedAssignment(normalizedMessage)) {
            return null;
        }

        return recommendations.get(0);
    }

    private boolean looksLikeNamedAssignment(String normalizedMessage) {
        int assignIndex = normalizedMessage.indexOf("assign ");
        if (assignIndex < 0) {
            return false;
        }

        String target = normalizedMessage.substring(assignIndex + "assign ".length()).trim();
        return !target.isBlank()
                && !target.startsWith("this ")
                && !target.startsWith("the ")
                && !target.startsWith("a worker")
                && !target.startsWith("someone")
                && !target.startsWith("best ");
    }

    private String explainRecommendation(RecommendationResponse recommendation) {
        if (recommendation.getReason() != null && !recommendation.getReason().isBlank()) {
            return recommendation.getReason();
        }

        return recommendation.getWorkerName()
                + " is eligible for this shift based on the current scheduling recommendation data.";
    }
}
