package com.saarthi.service;

import com.saarthi.dao.ReviewDAO;
import com.saarthi.model.ReviewRatingSummary;
import com.saarthi.model.SchemeReview;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class ReviewService {

    private final ReviewDAO reviewDAO = new ReviewDAO();

    public static class SchemeReviewsResult {
        public final List<SchemeReview> reviews;
        public final ReviewRatingSummary summary;

        public SchemeReviewsResult(List<SchemeReview> reviews, ReviewRatingSummary summary) {
            this.reviews = reviews;
            this.summary = summary;
        }
    }

    public SchemeReviewsResult getReviewsAndSummary(int schemeId, int currentUserId) throws SQLException {
        List<SchemeReview> reviews = reviewDAO.findBySchemeId(schemeId, currentUserId);
        ReviewRatingSummary summary = reviewDAO.getSummary(schemeId);
        return new SchemeReviewsResult(reviews, summary);
    }

    public SchemeReview submitReview(int userId, int schemeId, int rating, String title,
                                     String text, int smoothness, int weeks, boolean benefit) throws SQLException {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5 stars.");
        }
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Review title cannot be empty.");
        }
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Review text cannot be empty.");
        }
        if (smoothness < 1 || smoothness > 5) smoothness = 5;
        if (weeks < 1) weeks = 1;

        SchemeReview review = new SchemeReview();
        review.setSchemeId(schemeId);
        review.setUserId(userId);
        review.setRating(rating);
        review.setReviewTitle(title.trim());
        review.setReviewText(text.trim());
        review.setProcessSmoothness(smoothness);
        review.setApprovalTimeWeeks(weeks);
        review.setBenefitReceived(benefit);

        return reviewDAO.insertReview(review);
    }

    public static class LikeResult {
        public final boolean liked;
        public final int reviewId;

        public LikeResult(boolean liked, int reviewId) {
            this.liked = liked;
            this.reviewId = reviewId;
        }
    }

    public LikeResult toggleLike(int reviewId, int userId) throws SQLException {
        boolean liked = reviewDAO.toggleLike(reviewId, userId);
        return new LikeResult(liked, reviewId);
    }

    public Map<Integer, ReviewRatingSummary> getAllSummaries() throws SQLException {
        return reviewDAO.getAllSchemeSummaries();
    }
}
