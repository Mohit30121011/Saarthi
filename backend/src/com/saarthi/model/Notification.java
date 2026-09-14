package com.saarthi.model;

import java.time.LocalDateTime;

public class Notification {
    private int notificationId;
    private int userId;
    private Integer schemeId; // nullable
    private String type; // NEW_MATCH | DEADLINE_APPROACHING
    private String title;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;

    public int getNotificationId() { return notificationId; }
    public void setNotificationId(int notificationId) { this.notificationId = notificationId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public Integer getSchemeId() { return schemeId; }
    public void setSchemeId(Integer schemeId) { this.schemeId = schemeId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
