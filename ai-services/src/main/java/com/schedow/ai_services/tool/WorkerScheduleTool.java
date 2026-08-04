package com.schedow.ai_services.tool;

import java.util.List;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import com.schedow.ai_services.client.ScheduleClient;
import com.schedow.ai_services.dto.WorkerScheduleResponse;

@Component
public class WorkerScheduleTool {

    private final ScheduleClient scheduleClient;

    public WorkerScheduleTool(ScheduleClient scheduleClient) {
        this.scheduleClient = scheduleClient;
    }

@Tool(description = "Get a worker's schedule")
public List<WorkerScheduleResponse> getWorkerSchedule(

        @ToolParam(description = "Worker ID")
        Long userId

) {

    return scheduleClient.getWorkerSchedule(userId);

}

}