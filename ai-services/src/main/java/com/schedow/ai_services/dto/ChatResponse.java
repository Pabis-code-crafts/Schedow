package com.schedow.ai_services.dto;

public class ChatResponse {

    private String response;
    private String type = "MESSAGE";
    private ActionProposal actionProposal;

    public ChatResponse() {
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public ActionProposal getActionProposal() {
        return actionProposal;
    }

    public void setActionProposal(ActionProposal actionProposal) {
        this.actionProposal = actionProposal;
    }
}
