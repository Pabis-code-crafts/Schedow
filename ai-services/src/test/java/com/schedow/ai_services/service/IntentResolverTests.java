package com.schedow.ai_services.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.schedow.ai_services.dto.ChatContext;
import com.schedow.ai_services.dto.ContextType;

class IntentResolverTests {

    private final ContextBuilder contextBuilder = new ContextBuilder();
    private final IntentResolver intentResolver = new IntentResolver();

    @Test
    void usesShiftContextForAssignmentExplanations() {
        ChatContext context = new ChatContext();
        context.setContextType(ContextType.SHIFT);
        context.setDate(LocalDate.of(2026, 8, 3));
        context.setShiftId(1L);

        AiIntent intent = intentResolver.resolve("Why is Alex assigned here?", contextBuilder.build(context));

        assertThat(intent).isEqualTo(AiIntent.EXPLAIN_ASSIGNMENT);
    }

    @Test
    void treatsUnfilledShiftQuestionsAsSelectedWeekScheduleQuestions() {
        ChatContext context = new ChatContext();
        context.setContextType(ContextType.WEEK);
        context.setWeekStartDate(LocalDate.of(2026, 8, 3));

        AiIntent intent = intentResolver.resolve("Which shifts are still unfilled?", contextBuilder.build(context));

        assertThat(intent).isEqualTo(AiIntent.SHOW_WEEK);
    }

    @Test
    void treatsWeeklyOverviewAsSelectedWeekScheduleQuestion() {
        ChatContext context = new ChatContext();
        context.setContextType(ContextType.WEEK);
        context.setWeekStartDate(LocalDate.of(2026, 8, 3));

        AiIntent intent = intentResolver.resolve("Give me an overview of this week", contextBuilder.build(context));

        assertThat(intent).isEqualTo(AiIntent.SHOW_WEEK);
    }

    @Test
    void doesNotTreatShowScheduleAsAssignmentRequest() {
        ChatContext context = new ChatContext();
        context.setContextType(ContextType.WEEK);
        context.setWeekStartDate(LocalDate.of(2026, 8, 3));

        AiIntent intent = intentResolver.resolve("Show this week's schedule", contextBuilder.build(context));

        assertThat(intent).isEqualTo(AiIntent.SHOW_WEEK);
    }

    @Test
    void detectsHumanApprovalAssignmentRequest() {
        ChatContext context = new ChatContext();
        context.setContextType(ContextType.SHIFT);
        context.setDate(LocalDate.of(2026, 8, 3));
        context.setShiftId(1L);

        AiIntent intent = intentResolver.resolve("Assign Alex to this shift", contextBuilder.build(context));

        assertThat(intent).isEqualTo(AiIntent.ASSIGN_WORKER);
    }
}
