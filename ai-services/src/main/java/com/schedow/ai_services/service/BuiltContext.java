package com.schedow.ai_services.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.schedow.ai_services.dto.ChatContext;
import com.schedow.ai_services.dto.ContextType;

public class BuiltContext {

    private final ContextType contextType;
    private final LocalDate weekStartDate;
    private final LocalDate date;
    private final DayOfWeek dayOfWeek;
    private final Long shiftId;
    private final String shiftName;

    private final String startTime;

    private final String endTime;
    private final Long assignmentId;
    private final Long assignedWorkerId;
    private final String assignedWorkerName;
    private final List<String> warnings;

    BuiltContext(ChatContext source, List<String> warnings) {
        this.contextType = source.getContextType();
        this.weekStartDate = source.getWeekStartDate();
        this.date = source.getDate();
        this.dayOfWeek = source.getDayOfWeek();
        this.shiftId = source.getShiftId();
        this.shiftName = source.getShiftName();

        this.startTime = source.getStartTime();

        this.endTime = source.getEndTime();
        this.assignmentId = source.getAssignmentId();
        this.assignedWorkerId = source.getAssignedWorkerId();
        this.assignedWorkerName = source.getAssignedWorkerName();
        this.warnings = Collections.unmodifiableList(new ArrayList<>(warnings));
    }

    public boolean hasShiftTarget() {
        return shiftId != null && date != null && dayOfWeek != null;
    }

    public boolean hasWeekTarget() {
        return weekStartDate != null;
    }

    public boolean hasWorkerTarget() {
        return assignedWorkerId != null;
    }

    public boolean isShiftUnassigned() {
        return assignmentId == null && assignedWorkerId == null;
    }

    public String toPromptText() {
        return """
Context type: %s
Week start date: %s
Date: %s
Day of week: %s
Shift id: %s
Shift name: %s
Assignment id: %s
Assigned worker id: %s
Assigned worker name: %s
Assignment state: %s
Context warnings: %s
""".formatted(
                contextType,
                value(weekStartDate),
                value(date),
                value(dayOfWeek),
                value(shiftId),
                value(shiftName),
                value(assignmentId),
                value(assignedWorkerId),
                value(assignedWorkerName),
                isShiftUnassigned() ? "unassigned" : "assigned",
                warnings.isEmpty() ? "none" : String.join("; ", warnings)
        );
    }

    public ContextType getContextType() {
        return contextType;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public LocalDate getDate() {
        return date;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public Long getShiftId() {
        return shiftId;
    }

    public String getShiftName() {
        return shiftName;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public Long getAssignedWorkerId() {
        return assignedWorkerId;
    }

    public String getAssignedWorkerName() {
        return assignedWorkerName;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    static LocalDate mondayOf(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    private String value(Object value) {
        return value == null ? "not provided" : value.toString();
    }
}
