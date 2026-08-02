package com.schedow.ai_services.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.schedow.ai_services.dto.ChatRequest;
import com.schedow.ai_services.dto.ChatResponse;
import com.schedow.ai_services.tool.RecommendationTool;

@Service
public class ChatService {

    private final ChatClient chatClient;

    private final RecommendationTool recommendationTool;

public ChatService(
        ChatClient.Builder builder,
        RecommendationTool recommendationTool
) {

    this.recommendationTool = recommendationTool;

    this.chatClient = builder.build();

}
public ChatResponse chat(
        ChatRequest request
) {

    String answer =

            chatClient.prompt()

                    .system("""
You are Schedow AI.

Never answer scheduling questions yourself.

If the user asks anything about workers,
shifts,
recommendations,
availability,
or schedules,

ALWAYS call the appropriate tool first.
""")

                    .user(request.getMessage())

                    .tools(recommendationTool)

                    .call()

                    .content();

    ChatResponse response = new ChatResponse();

    response.setResponse(answer);

    return response;
}
}