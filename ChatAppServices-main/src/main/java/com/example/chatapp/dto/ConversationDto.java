package com.example.chatapp.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ConversationDto {
    private Long id;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<UserDto> participants;
    private MessageDto lastMessage;
    private long unreadCount;

    public ConversationDto() {}

    public ConversationDto(Long id, String title, LocalDateTime createdAt, LocalDateTime updatedAt,
                           List<UserDto> participants, MessageDto lastMessage) {
        this(id, title, createdAt, updatedAt, participants, lastMessage, 0L);
    }

    public ConversationDto(Long id, String title, LocalDateTime createdAt, LocalDateTime updatedAt,
                           List<UserDto> participants, MessageDto lastMessage, long unreadCount) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.participants = participants;
        this.lastMessage = lastMessage;
        this.unreadCount = unreadCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<UserDto> getParticipants() {
        return participants;
    }

    public void setParticipants(List<UserDto> participants) {
        this.participants = participants;
    }

    public MessageDto getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(MessageDto lastMessage) {
        this.lastMessage = lastMessage;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
    }
}
