package com.schedow.ai_services.service;

import java.util.Locale;

import org.springframework.stereotype.Component;

import com.schedow.ai_services.dto.ContextType;

@Component
public class IntentResolver {

    public AiIntent resolve(String message, BuiltContext context) {
        String normalized = normalize(message);

        if (containsAny(normalized, "assign ", "put ", "add ")) {
            return AiIntent.ASSIGN_WORKER;
        }

        if (containsAny(normalized, "recommend", "best worker", "who should", "suggest")) {
            return AiIntent.RECOMMEND_WORKER;
        }

        if (containsAny(normalized, "why", "explain", "reason")) {
            if (context.getContextType() == ContextType.SHIFT || context.getAssignmentId() != null) {
                return AiIntent.EXPLAIN_ASSIGNMENT;
            }
        }

        if (containsAny(normalized, "dashboard")) {
            return AiIntent.DASHBOARD_SUMMARY;
        }

        if (containsAny(normalized, "summary", "overview")) {
            if (containsAny(normalized, "week", "weekly", "this week") || context.getContextType() == ContextType.WEEK) {
                return AiIntent.SHOW_WEEK;
            }

            if (context.getContextType() == ContextType.DAY) {
                return AiIntent.SHOW_DAY;
            }

            return AiIntent.DASHBOARD_SUMMARY;
        }

        if (containsAny(normalized, "staffing", "staffed", "coverage", "covered", "enough people")) {
            return AiIntent.CHECK_STAFFING;
        }

        if (containsAny(normalized, "compare", "versus", " vs ")) {
            return AiIntent.COMPARE_WORKERS;
        }

        if (containsAny(normalized, "available", "free")) {
            return AiIntent.FIND_AVAILABLE_WORKERS;
        }

        if (containsAny(normalized, "week", "weekly")) {
            return AiIntent.SHOW_WEEK;
        }

        if (containsAny(normalized, "day", "today", "tomorrow")) {
            return AiIntent.SHOW_DAY;
        }

        if (containsAny(normalized, "worker", "person", "employee", "staff")) {
            return AiIntent.SHOW_WORKER;
        }

        if (context.getContextType() == ContextType.DASHBOARD) {
            return AiIntent.DASHBOARD_SUMMARY;
        }

        if (context.getContextType() == ContextType.WEEK) {
            return AiIntent.SHOW_WEEK;
        }

        if (context.getContextType() == ContextType.DAY) {
            return AiIntent.SHOW_DAY;
        }

        if (context.getContextType() == ContextType.WORKER) {
            return AiIntent.SHOW_WORKER;
        }

        if (context.getContextType() == ContextType.SHIFT) {
            return AiIntent.SHOW_SHIFT;
        }

        return AiIntent.GENERAL_CHAT;
    }

    private String normalize(String message) {
        return message == null ? "" : " " + message.toLowerCase(Locale.ROOT).trim() + " ";
    }

    private boolean containsAny(String value, String... needles) {
        for (String needle : needles) {
            if (value.contains(needle)) {
                return true;
            }
        }

        return false;
    }
}
