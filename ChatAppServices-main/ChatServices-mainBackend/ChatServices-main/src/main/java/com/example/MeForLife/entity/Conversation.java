package com.example.MeForLife.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "conversation")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long coversationId;

    @Column(name = "sender",unique = true)
    private String sender;
    @Column(name = "receiver")
    private String receiver;
    @Column(name = "dateTime")
    private String dateTime;

    public Conversation() {
    }

    public Conversation(Long coversationId, String sender, String receiver, String dateTime) {
        this.coversationId = coversationId;
        this.sender = sender;
        this.receiver = receiver;
        this.dateTime = dateTime;
    }

    public Long getCoversationId() {
        return coversationId;
    }

    public void setCoversationId(Long coversationId) {
        this.coversationId = coversationId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getReceiver() {
        return receiver;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }
}
