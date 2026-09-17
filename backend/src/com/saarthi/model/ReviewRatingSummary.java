package com.saarthi.model;

import java.util.Map;

public class ReviewRatingSummary {
    private int schemeId;
    private double averageRating;
    private int totalReviews;
    private double averageApprovalWeeks;
    private int benefitReceivedPercentage;
    private Map<Integer, Integer> ratingDistribution; // 5 -> count, 4 -> count, etc.
    private String lastVerifiedAt; // Date of latest verified citizen review

    public ReviewRatingSummary() {}

    public ReviewRatingSummary(int schemeId, double averageRating, int totalReviews,
                               double averageApprovalWeeks, int benefitReceivedPercentage,
                               Map<Integer, Integer> ratingDistribution) {
        this(schemeId, averageRating, totalReviews, averageApprovalWeeks, benefitReceivedPercentage, ratingDistribution, null);
    }

    public ReviewRatingSummary(int schemeId, double averageRating, int totalReviews,
                               double averageApprovalWeeks, int benefitReceivedPercentage,
                               Map<Integer, Integer> ratingDistribution, String lastVerifiedAt) {
        this.schemeId = schemeId;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.averageApprovalWeeks = averageApprovalWeeks;
        this.benefitReceivedPercentage = benefitReceivedPercentage;
        this.ratingDistribution = ratingDistribution;
        this.lastVerifiedAt = lastVerifiedAt;
    }

    public int getSchemeId() { return schemeId; }
    public void setSchemeId(int schemeId) { this.schemeId = schemeId; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public int getTotalReviews() { return totalReviews; }
    public void setTotalReviews(int totalReviews) { this.totalReviews = totalReviews; }

    public double getAverageApprovalWeeks() { return averageApprovalWeeks; }
    public void setAverageApprovalWeeks(double averageApprovalWeeks) { this.averageApprovalWeeks = averageApprovalWeeks; }

    public int getBenefitReceivedPercentage() { return benefitReceivedPercentage; }
    public void setBenefitReceivedPercentage(int benefitReceivedPercentage) { this.benefitReceivedPercentage = benefitReceivedPercentage; }

    public Map<Integer, Integer> getRatingDistribution() { return ratingDistribution; }
    public void setRatingDistribution(Map<Integer, Integer> ratingDistribution) { this.ratingDistribution = ratingDistribution; }

    public String getLastVerifiedAt() { return lastVerifiedAt; }
    public void setLastVerifiedAt(String lastVerifiedAt) { this.lastVerifiedAt = lastVerifiedAt; }
}
