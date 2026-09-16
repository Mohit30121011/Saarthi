package com.saarthi.model;

import java.time.LocalDateTime;

public class ChatSession {
    private int sessionId;
    private int userId;
    private LocalDateTime startedAt;
    private LocalDateTime lastMessageAt;
    private int messageCountToday;

    public int getSessionId() { return sessionId; }
    public void setSessionId(int sessionId) { this.sessionId = sessionId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public int getMessageCountToday() { return messageCountToday; }
    public void setMessageCountToday(int messageCountToday) { this.messageCountToday = messageCountToday; }
}
