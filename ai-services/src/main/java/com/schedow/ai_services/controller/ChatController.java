package com.schedow.ai_services.controller;

import com.schedow.ai_services.dto.ChatRequest;
import com.schedow.ai_services.dto.ChatResponse;
import com.schedow.ai_services.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(
            @RequestBody ChatRequest request
    ) {

        return chatService.chat(request);

    }

}