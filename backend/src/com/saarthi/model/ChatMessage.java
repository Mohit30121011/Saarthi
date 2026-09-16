package com.saarthi.model;

import java.time.LocalDateTime;

public class ChatMessage {
    private int messageId;
    private int sessionId;
    private String sender; // "USER" | "BOT"
    private String message;
    private String contextSchemeIds;
    private String flaggedUnverifiedMentions;
    private LocalDateTime createdAt;

    public int getMessageId() { return messageId; }
    public void setMessageId(int messageId) { this.messageId = messageId; }

    public int getSessionId() { return sessionId; }
    public void setSessionId(int sessionId) { this.sessionId = sessionId; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getContextSchemeIds() { return contextSchemeIds; }
    public void setContextSchemeIds(String contextSchemeIds) { this.contextSchemeIds = contextSchemeIds; }

    public String getFlaggedUnverifiedMentions() { return flaggedUnverifiedMentions; }
    public void setFlaggedUnverifiedMentions(String flaggedUnverifiedMentions) { this.flaggedUnverifiedMentions = flaggedUnverifiedMentions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
