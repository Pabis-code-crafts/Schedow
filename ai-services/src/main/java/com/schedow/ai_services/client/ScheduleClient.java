package com.schedow.ai_services.client;

import java.time.LocalDate;
import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.schedow.ai_services.dto.AssignmentValidationRequest;
import com.schedow.ai_services.dto.AssignmentValidationResponse;
import com.schedow.ai_services.dto.DashboardResponse;
import com.schedow.ai_services.dto.RecommendationRequest;
import com.schedow.ai_services.dto.RecommendationResponse;
import com.schedow.ai_services.dto.WeekScheduleResponse;
import com.schedow.ai_services.dto.WorkerScheduleResponse;

@Component
public class ScheduleClient {

    private final RestClient restClient;

    public ScheduleClient(
            @Value("${schedule.service.base-url}") String scheduleServiceBaseUrl
    ) {

        this.restClient = RestClient.builder()
                .baseUrl(scheduleServiceBaseUrl)
                .build();

    }

    public List<RecommendationResponse> recommend(
            RecommendationRequest request
    ) {

        return restClient.post()
                .uri("/recommendations")
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

    }


    public List<WeekScheduleResponse.ShiftTemplate> getShiftTemplates() {

        return restClient.get()
                .uri("/shifts")
                .retrieve()
                .body(new ParameterizedTypeReference<List<WeekScheduleResponse.ShiftTemplate>>() {});

    }
    public List<WeekScheduleResponse> getWeekSchedule(LocalDate weekStartDate) {

        return restClient.get()
                .uri("/assignments/week/{weekStartDate}", weekStartDate)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

    }

    public List<WorkerScheduleResponse> getWorkerSchedule(Long userId) {

        return restClient.get()
                .uri("/workers/{userId}", userId)
                .retrieve()
                .body(new ParameterizedTypeReference<List<WorkerScheduleResponse>>() {});

    }
    public DashboardResponse getDashboard() {

        return restClient.get()
                .uri("/dashboard")
                .retrieve()
                .body(DashboardResponse.class);

    }

    public List<WorkerScheduleResponse> getWorkerSchedule(Long userId, LocalDate weekStartDate) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/workers/{userId}")
                        .queryParam("weekStartDate", weekStartDate)
                        .build(userId))
                .retrieve()
                .body(new ParameterizedTypeReference<List<WorkerScheduleResponse>>() {});

    }

    public AssignmentValidationResponse validateAssignment(AssignmentValidationRequest request) {

        return restClient.post()
                .uri("/assignments/validate")
                .body(request)
                .retrieve()
                .body(AssignmentValidationResponse.class);

    }
}
