package com.example.chatapp.controller;

import com.example.chatapp.dto.ConversationDto;
import com.example.chatapp.dto.CreateConversationRequest;
import com.example.chatapp.dto.LoginRequest;
import com.example.chatapp.dto.MessageDto;
import com.example.chatapp.dto.SendMessageRequest;
import com.example.chatapp.dto.MarkConversationReadRequest;
import com.example.chatapp.entity.User;
import com.example.chatapp.service.ChatService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody User user) {
        return ResponseEntity.ok(chatService.registerUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(chatService.login(request));
    }

    @GetMapping("/users/{userId}/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(@PathVariable Long userId) {
        return ResponseEntity.ok(chatService.getConversations(userId));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationDto> startConversation(
            @Valid @RequestBody CreateConversationRequest request) {
        return ResponseEntity.ok(chatService.createConversation(request));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageDto>> getMessages(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatService.getMessages(conversationId));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<MessageDto> sendMessage(@PathVariable Long conversationId,
                                                  @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(conversationId, request));
    }

    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ConversationDto> markConversationRead(@PathVariable Long conversationId,
                                                                @Valid @RequestBody MarkConversationReadRequest request) {
        return ResponseEntity.ok(chatService.markConversationAsRead(conversationId, request));
    }
}
