package com.example.MeForLife.entity;


import jakarta.persistence.*;

@Entity
@Table(name = "messages")
public class Messages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long messageID;
    @Column(name = "content")
    private String content;
    @Column(name = "sender")
    private String sender;
    @Column(name = "receiver")
    private String receiver;
    @Column(name = "dateTime")
    private String  dateTime;
    @Column(name = "conversationID")
    private Long conversationID;
    @Column(name = "chatTime")
    private String chatTime;
    @Column(name = "chatimage" , columnDefinition = "LONGTEXT")
    private String chatimage;




    public Messages() {
    }

    public Messages(Long messageID, String content, String sender, String receiver, String dateTime, Long conversationID,String chatimage, String chatTime) {
        this.messageID = messageID;
        this.content = content;
        this.sender = sender;
        this.receiver = receiver;
        this.dateTime = dateTime;
        this.conversationID = conversationID;
        this.chatimage=chatimage;
        this.chatTime=chatTime;
    }

    public String getChatTime() {
        return chatTime;
    }

    public void setChatTime(String chatTime) {
        this.chatTime = chatTime;
    }

    public String getChatimage() {
        return chatimage;
    }

    public void setChatimage(String chatimage) {
        this.chatimage = chatimage;
    }

    public Long getMessageID() {
        return messageID;
    }

    public void setMessageID(Long messageID) {
        this.messageID = messageID;
    }

    public String getcontent() {
        return content;
    }

    public void setcontent(String content) {
        this.content = content;
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

    public Long getConversationID() {
        return conversationID;
    }

    public void setConversationID(Long conversationID) {
        this.conversationID = conversationID;
    }
}
