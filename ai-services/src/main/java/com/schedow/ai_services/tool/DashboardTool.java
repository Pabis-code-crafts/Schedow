package com.schedow.ai_services.tool;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import com.schedow.ai_services.client.ScheduleClient;
import com.schedow.ai_services.dto.DashboardResponse;

@Component
public class DashboardTool {

    private final ScheduleClient scheduleClient;

    public DashboardTool(ScheduleClient scheduleClient) {
        this.scheduleClient = scheduleClient;
    }

    @Tool(description = "Get scheduling dashboard summary")
    public DashboardResponse getDashboard() {

        return scheduleClient.getDashboard();

    }

}