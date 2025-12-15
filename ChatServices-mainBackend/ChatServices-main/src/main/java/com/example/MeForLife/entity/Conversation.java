package com.example.MeForLife.entity;


import jakarta.persistence.*;

// This class is a JPA entit, this basically represents a table in a database
@Entity
@Table(name = "conversation")
public class Conversation {
	
	// the conversation identity i declared as ID meaning the conversation is unique and searchable with unique id 
    @Id
    // conversation id are auto generated using the incremental feature in the database which ensure uniqueness as the id appears only onee in the table
    // primary key is auto generated here 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long coversationId;

    // the user who login and add another person's email address to start the conv which creates the conversation id 
    // the person who initiated this will be considered sender, denoted as col name sender
    @Column(name = "sender",unique = true)
    private String sender;
    // col name receiver is the one who gets added 
    @Column(name = "receiver")
    private String receiver;
    // date time col picks the startconv logic set in the controller has the datetime logic 
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
