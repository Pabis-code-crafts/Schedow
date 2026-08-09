package com.schedow.ai_services.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.schedow.ai_services.dto.ActionProposal;

public class CoordinatedToolContext {

    private final List<ToolResult> results;
    private final ActionProposal actionProposal;

    CoordinatedToolContext(List<ToolResult> results, ActionProposal actionProposal) {
        this.results = Collections.unmodifiableList(new ArrayList<>(results));
        this.actionProposal = actionProposal;
    }

    public List<ToolResult> getResults() {
        return results;
    }

    public ActionProposal getActionProposal() {
        return actionProposal;
    }

    public boolean hasToolData() {
        return !results.isEmpty();
    }
}
