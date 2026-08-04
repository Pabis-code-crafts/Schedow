package com.schedow.ai_services.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.schedow.ai_services.dto.ChatRequest;
import com.schedow.ai_services.dto.ChatResponse;
import com.schedow.ai_services.tool.DashboardTool;
import com.schedow.ai_services.tool.RecommendationTool;
import com.schedow.ai_services.tool.WeekScheduleTool;
import com.schedow.ai_services.tool.WorkerScheduleTool;

@Service
public class ChatService {

    private final ChatClient chatClient;

    private final RecommendationTool recommendationTool;
    private final WeekScheduleTool weekScheduleTool;
    private final WorkerScheduleTool workerScheduleTool;
    private final DashboardTool dashboardTool;

    public ChatService(
            ChatClient.Builder builder,
            RecommendationTool recommendationTool,
            WeekScheduleTool weekScheduleTool,
            WorkerScheduleTool workerScheduleTool,
            DashboardTool dashboardTool
    ) {

        this.chatClient = builder.build();

        this.recommendationTool = recommendationTool;
        this.weekScheduleTool = weekScheduleTool;
        this.workerScheduleTool = workerScheduleTool;
        this.dashboardTool = dashboardTool;
    }

    public ChatResponse chat(ChatRequest request) {

        String answer = chatClient.prompt()

                .system("""
You are Schedow AI.

You are an AI scheduling assistant.

Never make up scheduling information.

Always use the available tools whenever the user asks about:

- worker recommendations
- schedules
- dashboard summaries
- worker schedules
- staffing
- shifts

Use the tool first, then explain the result naturally.
""")

                .user(request.getMessage())

                .tools(
                        recommendationTool,
                        weekScheduleTool,
                        workerScheduleTool,
                        dashboardTool
                )

                .call()

                .content();

        ChatResponse response = new ChatResponse();
        response.setResponse(answer);

        return response;
    }

}