package com.schedow.ai_services.client;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.schedow.ai_services.dto.RecommendationRequest;
import com.schedow.ai_services.dto.RecommendationResponse;

@Component
public class ScheduleClient {

    private final RestClient restClient;

    public ScheduleClient() {

        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8084/api/v1/schedules")
                .build();

    }
    
    public List<RecommendationResponse> recommend(
        RecommendationRequest request
) {

    return restClient.post()
            .uri("/recommendations")
            .body(request)
            .retrieve()
            .body(
                    new ParameterizedTypeReference<>() {
                    }
            );

}

}