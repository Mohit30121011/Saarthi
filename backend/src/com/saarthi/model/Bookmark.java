package com.saarthi.model;

import java.time.LocalDateTime;

public class Bookmark {
    private int bookmarkId;
    private int userId;
    private int schemeId;
    private LocalDateTime createdAt;

    public int getBookmarkId() { return bookmarkId; }
    public void setBookmarkId(int bookmarkId) { this.bookmarkId = bookmarkId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getSchemeId() { return schemeId; }
    public void setSchemeId(int schemeId) { this.schemeId = schemeId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
