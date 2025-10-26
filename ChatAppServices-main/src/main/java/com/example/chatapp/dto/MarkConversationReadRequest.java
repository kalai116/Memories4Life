package com.example.chatapp.dto;

import jakarta.validation.constraints.NotNull;

public class MarkConversationReadRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    private Long messageId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }
}
