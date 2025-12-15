package com.example.MeForLife.entity;

// This is a DTO (Data Transfer Object) used to send a more organised authentication results
// includes message, (depending on success/failure) status, and username from backend to frontend 
public class AuthResponse {
    private boolean success;
    private String message;
    private String username;

    // Empty constructor to create a conversation object first and then add the fields 
    public AuthResponse() {}

    // parameters are passed to ease the cration of reponse objects
    public AuthResponse(boolean success, String message, String username) {
        this.success = success;
        this.message = message;
        this.username = username;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }

    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
}
