package com.example.chatapp.websocket;

import com.example.chatapp.dto.SocketEvent;
import com.example.chatapp.service.ChatService;
import com.example.chatapp.service.ChatSocketService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketHandler.class);

    private final ChatSocketService chatSocketService;
    private final ChatService chatService;
    private final ObjectMapper objectMapper;

    public ChatWebSocketHandler(ChatSocketService chatSocketService,
                                ChatService chatService,
                                ObjectMapper objectMapper) {
        this.chatSocketService = chatSocketService;
        this.chatService = chatService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = extractUserId(session);
        if (userId == null) {
            log.debug("Closing websocket session {} - missing userId", session.getId());
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        chatSocketService.registerSession(userId, session);
        sendStatus(session, "connected");
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        chatSocketService.unregisterSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.debug("WebSocket transport error for session {}", session.getId(), exception);
        chatSocketService.unregisterSession(session);
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        if (message == null || !StringUtils.hasText(message.getPayload())) {
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(message.getPayload());
            String type = resolveType(root);

            if (!"typing".equals(type)) {
                log.debug("Received unsupported websocket event type '{}'", type);
                return;
            }

            Long conversationId = resolveLong(root, "conversationId");
            if (conversationId == null) {
                log.debug("Ignoring typing event without conversationId {}", message.getPayload());
                return;
            }

            Long sessionUserId = chatSocketService.getUserIdForSession(session);
            Long payloadUserId = resolveLong(root, "userId");
            Long userId = payloadUserId != null ? payloadUserId : sessionUserId;
            if (sessionUserId == null || userId == null || !Objects.equals(sessionUserId, userId)) {
                log.debug("Ignoring typing event due to user mismatch. sessionUserId={}, payloadUserId={}",
                        sessionUserId, payloadUserId);
                return;
            }

            boolean isTyping = resolveBoolean(root, "isTyping", true);
            try {
                chatService.handleTypingSignal(conversationId, userId, isTyping);
            } catch (IllegalArgumentException ex) {
                log.debug("Rejected typing signal for conversation {} user {}: {}", conversationId, userId, ex.getMessage());
            }
        } catch (Exception ex) {
            log.debug("Failed to process websocket payload {}", message.getPayload(), ex);
        }
    }

    private void sendStatus(WebSocketSession session, String status) {
        if (!session.isOpen()) {
            return;
        }
        try {
            String payload = objectMapper.writeValueAsString(new SocketEvent<>("status", status));
            session.sendMessage(new TextMessage(payload));
        } catch (IOException e) {
            log.debug("Failed to send status message to session {}", session.getId(), e);
        }
    }

    private Long extractUserId(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null || uri.getQuery() == null) {
            return null;
        }

        Map<String, String> params = Arrays.stream(uri.getQuery().split("&"))
                .map(pair -> pair.split("=", 2))
                .filter(parts -> parts.length == 2)
                .collect(Collectors.toMap(
                        parts -> decode(parts[0]),
                        parts -> decode(parts[1]),
                        (left, right) -> right));

        String userId = params.get("userId");
        if (userId == null) {
            return null;
        }
        try {
            return Long.valueOf(userId);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private String resolveType(JsonNode root) {
        if (root == null) {
            return "";
        }
        String directType = normalize(root.path("type").asText(null));
        if (StringUtils.hasText(directType)) {
            return directType;
        }
        JsonNode payload = root.path("payload");
        return normalize(payload.path("type").asText(""));
    }

    private Long resolveLong(JsonNode root, String field) {
        Long value = parseLong(root != null ? root.path(field) : null);
        if (value != null) {
            return value;
        }
        JsonNode payload = root != null ? root.path("payload") : null;
        return parseLong(payload != null ? payload.path(field) : null);
    }

    private Long parseLong(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        if (node.isNumber()) {
            return node.longValue();
        }
        if (node.isTextual()) {
            String text = node.asText().trim();
            if (!StringUtils.hasText(text)) {
                return null;
            }
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private boolean resolveBoolean(JsonNode root, String field, boolean defaultValue) {
        Boolean value = parseBoolean(root != null ? root.path(field) : null);
        if (value != null) {
            return value;
        }
        JsonNode payload = root != null ? root.path("payload") : null;
        if (payload == null || payload.isMissingNode() || payload.isNull()) {
            return defaultValue;
        }
        value = parseBoolean(payload.path(field));
        return value != null ? value : defaultValue;
    }

    private Boolean parseBoolean(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        if (node.isBoolean()) {
            return node.booleanValue();
        }
        if (node.isTextual()) {
            String text = node.asText().trim().toLowerCase();
            if ("true".equals(text)) {
                return true;
            }
            if ("false".equals(text)) {
                return false;
            }
        }
        return null;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
