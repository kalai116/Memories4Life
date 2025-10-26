package com.example.chatapp.service;

import com.example.chatapp.dto.ConversationDto;
import com.example.chatapp.dto.MessageDto;
import com.example.chatapp.dto.SocketEvent;
import com.example.chatapp.dto.TypingDto;
import com.example.chatapp.dto.UserDto;
import com.example.chatapp.entity.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Service
public class ChatSocketService {

    private static final Logger log = LoggerFactory.getLogger(ChatSocketService.class);

    private final ObjectMapper objectMapper;
    private final Map<Long, Set<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();
    private final Map<String, Long> sessionToUser = new ConcurrentHashMap<>();

    public ChatSocketService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void registerSession(Long userId, WebSocketSession session) {
        if (userId == null || session == null) {
            return;
        }
        sessionsByUser
                .computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet())
                .add(session);
        sessionToUser.put(session.getId(), userId);
        log.debug("Registered websocket session {} for user {}", session.getId(), userId);
    }

    public void unregisterSession(WebSocketSession session) {
        if (session == null) {
            return;
        }
        Long userId = sessionToUser.remove(session.getId());
        if (userId != null) {
            Set<WebSocketSession> sessions = sessionsByUser.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    sessionsByUser.remove(userId);
                }
            }
            log.debug("Unregistered websocket session {} for user {}", session.getId(), userId);
        }
    }

    public Long getUserIdForSession(WebSocketSession session) {
        if (session == null) {
            return null;
        }
        return sessionToUser.get(session.getId());
    }

    public void broadcastConversation(ConversationDto conversation) {
        if (conversation == null) {
            return;
        }
        Set<Long> recipients = conversation.getParticipants().stream()
                .map(UserDto::getId)
                .collect(Collectors.toSet());
        sendToUsers(recipients, new SocketEvent<>("conversation", conversation));
    }

    public void broadcastMessage(MessageDto message, Collection<User> participants) {
        if (message == null || participants == null) {
            return;
        }
        Set<Long> recipients = participants.stream()
                .map(User::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        sendToUsers(recipients, new SocketEvent<>("message", message));
    }

    public void broadcastTyping(TypingDto typing, Collection<User> participants, Long excludeUserId) {
        if (typing == null || participants == null) {
            return;
        }
        Set<Long> recipients = participants.stream()
                .map(User::getId)
                .filter(Objects::nonNull)
                .filter(id -> excludeUserId == null || !Objects.equals(id, excludeUserId))
                .collect(Collectors.toSet());
        if (recipients.isEmpty()) {
            return;
        }
        Map<String, Object> envelope = new HashMap<>();
        envelope.put("type", "typing");
        envelope.put("conversationId", typing.getConversationId());
        envelope.put("userId", typing.getUserId());
        envelope.put("isTyping", typing.isTyping());
        envelope.put("typing", typing.isTyping());
        envelope.put("payload", typing);
        if (typing.getUser() != null) {
            envelope.put("user", typing.getUser());
            String displayName = resolveDisplayName(typing.getUser());
            if (StringUtils.hasText(displayName)) {
                envelope.put("displayName", displayName);
            }
        }
        envelope.put("status", typing.isTyping() ? "typing" : "stopped");

        sendToUsers(recipients, envelope);
    }

    private void sendToUsers(Collection<Long> userIds, Object event) {
        if (userIds == null || event == null || userIds.isEmpty()) {
            return;
        }
//        String payload;
        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            String eventName;
            if (event instanceof SocketEvent<?> socketEvent) {
                eventName = socketEvent.getType();
            } else {
                eventName = event.getClass().getSimpleName();
            }
            log.warn("Failed to serialize socket event {}", eventName, e);
            return;
        }

        TextMessage message = new TextMessage(payload);
        userIds.stream()
                .map(sessionsByUser::get)
                .filter(set -> set != null && !set.isEmpty())
                .forEach(sessions -> sendToSessions(message, sessions));
    }

    private void sendToSessions(TextMessage message, Set<WebSocketSession> sessions) {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(message);
                } catch (IOException e) {
                    log.debug("Failed to send websocket message to session {}", session.getId(), e);
                }
            }
        }
    }

    private String resolveDisplayName(UserDto user) {
        if (user == null) {
            return null;
        }
        if (StringUtils.hasText(user.getUsername())) {
            return user.getUsername();
        }
        return user.getEmail();
    }
}
