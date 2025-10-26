package com.example.chatapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TypingDto {
    private Long conversationId;
    private Long userId;
    private boolean typing;
    private UserDto user;

    public TypingDto() {}

    public TypingDto(Long conversationId, Long userId, boolean typing, UserDto user) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.typing = typing;
        this.user = user;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isTyping() {
        return typing;
    }

    public void setTyping(boolean typing) {
        this.typing = typing;
    }

    @JsonProperty("isTyping")
    public boolean getIsTyping() {
        return typing;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }
}
