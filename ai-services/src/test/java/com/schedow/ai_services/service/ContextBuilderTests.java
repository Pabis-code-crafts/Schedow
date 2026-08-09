package com.schedow.ai_services.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.DayOfWeek;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.schedow.ai_services.dto.ChatContext;
import com.schedow.ai_services.dto.ContextType;

class ContextBuilderTests {

    private final ContextBuilder contextBuilder = new ContextBuilder();

    @Test
    void fillsDayAndWeekFromDate() {
        ChatContext context = new ChatContext();
        context.setContextType(ContextType.SHIFT);
        context.setDate(LocalDate.of(2026, 8, 6));
        context.setShiftId(5L);

        BuiltContext builtContext = contextBuilder.build(context);

        assertThat(builtContext.getDayOfWeek()).isEqualTo(DayOfWeek.THURSDAY);
        assertThat(builtContext.getWeekStartDate()).isEqualTo(LocalDate.of(2026, 8, 3));
        assertThat(builtContext.getWarnings()).isEmpty();
    }

    @Test
    void normalizesMismatchedDayOfWeek() {
        ChatContext context = new ChatContext();
        context.setContextType(ContextType.DAY);
        context.setDate(LocalDate.of(2026, 8, 6));
        context.setDayOfWeek(DayOfWeek.MONDAY);

        BuiltContext builtContext = contextBuilder.build(context);

        assertThat(builtContext.getDayOfWeek()).isEqualTo(DayOfWeek.THURSDAY);
        assertThat(builtContext.getWarnings()).containsExactly(
                "dayOfWeek did not match date and was normalized to THURSDAY"
        );
    }
}
