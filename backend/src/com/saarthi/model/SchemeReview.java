package com.saarthi.model;

public class SchemeReview {
    private int reviewId;
    private int schemeId;
    private int userId;
    private String reviewerName;
    private String reviewerState;
    private int rating;
    private String reviewTitle;
    private String reviewText;
    private int processSmoothness; // 1-5
    private int approvalTimeWeeks;
    private boolean benefitReceived;
    private int likesCount;
    private boolean likedByCurrentUser;
    private String createdAt;
    private String updatedAt;

    public SchemeReview() {}

    public SchemeReview(int reviewId, int schemeId, int userId, String reviewerName, String reviewerState,
                        int rating, String reviewTitle, String reviewText, int processSmoothness,
                        int approvalTimeWeeks, boolean benefitReceived, int likesCount,
                        boolean likedByCurrentUser, String createdAt, String updatedAt) {
        this.reviewId = reviewId;
        this.schemeId = schemeId;
        this.userId = userId;
        this.reviewerName = reviewerName;
        this.reviewerState = reviewerState;
        this.rating = rating;
        this.reviewTitle = reviewTitle;
        this.reviewText = reviewText;
        this.processSmoothness = processSmoothness;
        this.approvalTimeWeeks = approvalTimeWeeks;
        this.benefitReceived = benefitReceived;
        this.likesCount = likesCount;
        this.likedByCurrentUser = likedByCurrentUser;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getReviewId() { return reviewId; }
    public void setReviewId(int reviewId) { this.reviewId = reviewId; }

    public int getSchemeId() { return schemeId; }
    public void setSchemeId(int schemeId) { this.schemeId = schemeId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public String getReviewerState() { return reviewerState; }
    public void setReviewerState(String reviewerState) { this.reviewerState = reviewerState; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getReviewTitle() { return reviewTitle; }
    public void setReviewTitle(String reviewTitle) { this.reviewTitle = reviewTitle; }

    public String getReviewText() { return reviewText; }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }

    public int getProcessSmoothness() { return processSmoothness; }
    public void setProcessSmoothness(int processSmoothness) { this.processSmoothness = processSmoothness; }

    public int getApprovalTimeWeeks() { return approvalTimeWeeks; }
    public void setApprovalTimeWeeks(int approvalTimeWeeks) { this.approvalTimeWeeks = approvalTimeWeeks; }

    public boolean isBenefitReceived() { return benefitReceived; }
    public void setBenefitReceived(boolean benefitReceived) { this.benefitReceived = benefitReceived; }

    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }

    public boolean isLikedByCurrentUser() { return likedByCurrentUser; }
    public void setLikedByCurrentUser(boolean likedByCurrentUser) { this.likedByCurrentUser = likedByCurrentUser; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
