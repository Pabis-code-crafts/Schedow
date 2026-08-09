package com.schedow.ai_services.service;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.schedow.ai_services.dto.ChatContext;
import com.schedow.ai_services.dto.ContextType;

@Component
public class ContextBuilder {

    public BuiltContext build(ChatContext incomingContext) {
        ChatContext context = incomingContext == null ? new ChatContext() : incomingContext;
        List<String> warnings = new ArrayList<>();

        if (context.getContextType() == null) {
            context.setContextType(ContextType.NONE);
        }

        if (context.getDayOfWeek() == null && context.getDate() != null) {
            context.setDayOfWeek(context.getDate().getDayOfWeek());
        }

        if (context.getWeekStartDate() == null && context.getDate() != null) {
            context.setWeekStartDate(BuiltContext.mondayOf(context.getDate()));
        }

        if (context.getDate() != null && context.getDayOfWeek() != null
                && context.getDate().getDayOfWeek() != context.getDayOfWeek()) {
            DayOfWeek normalizedDay = context.getDate().getDayOfWeek();
            warnings.add("dayOfWeek did not match date and was normalized to " + normalizedDay);
            context.setDayOfWeek(normalizedDay);
        }

        validateTarget(context, warnings);

        return new BuiltContext(context, warnings);
    }

    private void validateTarget(ChatContext context, List<String> warnings) {
        switch (context.getContextType()) {
            case SHIFT -> {
                warnIfMissing(context.getShiftId(), "shiftId", warnings);
                warnIfMissing(context.getDate(), "date", warnings);
            }
            case DAY -> warnIfMissing(context.getDate(), "date", warnings);
            case WEEK -> warnIfMissing(context.getWeekStartDate(), "weekStartDate", warnings);
            case WORKER -> warnIfMissing(context.getAssignedWorkerId(), "assignedWorkerId", warnings);
            case DASHBOARD, NONE -> {
            }
        }
    }

    private void warnIfMissing(Object value, String fieldName, List<String> warnings) {
        if (value == null) {
            warnings.add(fieldName + " is missing for this context");
        }
    }
}
