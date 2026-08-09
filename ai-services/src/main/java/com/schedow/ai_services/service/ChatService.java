package com.schedow.ai_services.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.schedow.ai_services.dto.ChatRequest;
import com.schedow.ai_services.dto.ChatResponse;

@Service
public class ChatService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final ContextBuilder contextBuilder;
    private final IntentResolver intentResolver;
    private final ToolCoordinator toolCoordinator;

    public ChatService(
            ChatClient.Builder builder,
            ContextBuilder contextBuilder,
            IntentResolver intentResolver,
            ToolCoordinator toolCoordinator
    ) {

        this.chatClient = builder.build();
        this.contextBuilder = contextBuilder;
        this.intentResolver = intentResolver;
        this.toolCoordinator = toolCoordinator;
    }

    public ChatResponse chat(ChatRequest request) {
        BuiltContext context = contextBuilder.build(request.getContext());
        AiIntent intent = intentResolver.resolve(request.getMessage(), context);
        CoordinatedToolContext toolContext = toolCoordinator.coordinate(intent, context, request.getMessage());

        String answer = chatClient.prompt()
                .system("""
You are Schedow AI.

You are a scheduling copilot for managers.
Be concise, practical, and conversational.
Use the provided context and backend tool results as facts.
Never invent schedules, assignments, availability, scores, or worker details.
Treat the active scheduling context as authoritative for words like this shift, here, this worker, and today.
If assignment state is unassigned, do not explain why a worker was assigned or imply a replacement exists.
When data is missing, ask a focused follow-up question.
Explain recommendations in manager-friendly language without exposing raw scoring mechanics.
Never claim that a schedule change has been made.
""")
                .user(buildUserPrompt(request, context, intent, toolContext))
                .call()
                .content();

        ChatResponse response = new ChatResponse();
        response.setResponse(answer);
        if (toolContext.getActionProposal() != null) {
            response.setType("ACTION_PROPOSAL");
            response.setActionProposal(toolContext.getActionProposal());
        }

        return response;
    }

    private String buildUserPrompt(
            ChatRequest request,
            BuiltContext context,
            AiIntent intent,
            CoordinatedToolContext toolContext
    ) {
        return """
User message:
%s

Resolved backend intent:
%s

Active scheduling context:
%s

Backend tool results:
%s

Response instructions:
- Answer the user's question using the backend facts above.
- If tool results include an error or required context is missing, explain what is needed next.
- If assignment validation is invalid, explain the scheduling reason and do not invite approval.
- If an action proposal is present, tell the manager it is ready for approval and do not say it has been applied.
- For unfilled-shift questions, use unfilledSlots from the selected week schedule summary. Do not infer unfilled shifts from assignment counts alone.
- Format reasoning as clean sections, for example Availability followed by the sentence. Do not use stray asterisks.
""".formatted(
                request.getMessage(),
                intent,
                context.toPromptText(),
                toJson(toolContext)
        );
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            return "Unable to serialize backend facts: " + exception.getMessage();
        }
    }
}
