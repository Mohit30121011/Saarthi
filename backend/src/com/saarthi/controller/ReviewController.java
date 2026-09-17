package com.saarthi.controller;

import com.google.gson.JsonObject;
import com.saarthi.model.ReviewRatingSummary;
import com.saarthi.model.SchemeReview;
import com.saarthi.service.ReviewService;
import com.saarthi.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;
import java.util.stream.Collectors;

@WebServlet({"/api/schemes/reviews", "/api/schemes/reviews/like", "/api/schemes/rating-summaries"})
public class ReviewController extends HttpServlet {

    private final ReviewService reviewService = new ReviewService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getServletPath();

        if (path.endsWith("/rating-summaries")) {
            handleGetSummaries(req, resp);
        } else {
            handleGetReviews(req, resp);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getServletPath();

        if (path.endsWith("/like")) {
            handleToggleLike(req, resp);
        } else {
            handleSubmitReview(req, resp);
        }
    }

    private void handleGetReviews(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String schemeIdParam = req.getParameter("schemeId");
        if (schemeIdParam == null || schemeIdParam.trim().isEmpty()) {
            JsonUtil.writeError(resp, 400, "Missing schemeId parameter.");
            return;
        }

        int schemeId;
        try {
            schemeId = Integer.parseInt(schemeIdParam.trim());
        } catch (NumberFormatException e) {
            JsonUtil.writeError(resp, 400, "Invalid schemeId parameter.");
            return;
        }

        Object uidAttr = req.getAttribute("userId");
        int userId = (uidAttr instanceof Integer) ? (Integer) uidAttr : 0;

        try {
            ReviewService.SchemeReviewsResult result = reviewService.getReviewsAndSummary(schemeId, userId);
            JsonUtil.writeJson(resp, 200, result);
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "Failed to load scheme reviews: " + e.getMessage());
        }
    }

    private void handleGetSummaries(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            Map<Integer, ReviewRatingSummary> map = reviewService.getAllSummaries();
            JsonUtil.writeJson(resp, 200, map);
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "Failed to load rating summaries: " + e.getMessage());
        }
    }

    private void handleSubmitReview(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Object uidAttr = req.getAttribute("userId");
        int userId = (uidAttr instanceof Integer) ? (Integer) uidAttr : 0;
        if (userId <= 0) {
            JsonUtil.writeError(resp, 401, "You must be logged in to leave a review.");
            return;
        }

        JsonObject body = readJsonBody(req);
        if (body == null) {
            JsonUtil.writeError(resp, 400, "Missing request body.");
            return;
        }

        int schemeId = body.has("schemeId") ? body.get("schemeId").getAsInt() : 0;
        int rating = body.has("rating") ? body.get("rating").getAsInt() : 5;
        String title = body.has("reviewTitle") ? body.get("reviewTitle").getAsString() : "";
        String text = body.has("reviewText") ? body.get("reviewText").getAsString() : "";
        int smoothness = body.has("processSmoothness") ? body.get("processSmoothness").getAsInt() : 5;
        int weeks = body.has("approvalTimeWeeks") ? body.get("approvalTimeWeeks").getAsInt() : 2;
        boolean benefit = !body.has("benefitReceived") || body.get("benefitReceived").getAsBoolean();

        if (schemeId <= 0) {
            JsonUtil.writeError(resp, 400, "Valid schemeId is required.");
            return;
        }

        try {
            SchemeReview review = reviewService.submitReview(userId, schemeId, rating, title, text, smoothness, weeks, benefit);
            ReviewRatingSummary updatedSummary = reviewService.getReviewsAndSummary(schemeId, userId).summary;
            JsonObject response = new JsonObject();
            response.add("review", JsonUtil.gson().toJsonTree(review));
            response.add("summary", JsonUtil.gson().toJsonTree(updatedSummary));
            JsonUtil.writeJson(resp, 201, response);
        } catch (IllegalArgumentException e) {
            JsonUtil.writeError(resp, 400, e.getMessage());
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "Failed to submit review: " + e.getMessage());
        }
    }

    private void handleToggleLike(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Object uidAttr = req.getAttribute("userId");
        int userId = (uidAttr instanceof Integer) ? (Integer) uidAttr : 0;
        if (userId <= 0) {
            JsonUtil.writeError(resp, 401, "Please log in to like reviews.");
            return;
        }

        JsonObject body = readJsonBody(req);
        int reviewId = (body != null && body.has("reviewId")) ? body.get("reviewId").getAsInt() : 0;
        if (reviewId <= 0) {
            JsonUtil.writeError(resp, 400, "Valid reviewId is required.");
            return;
        }

        try {
            ReviewService.LikeResult result = reviewService.toggleLike(reviewId, userId);
            JsonUtil.writeJson(resp, 200, result);
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "Failed to toggle like: " + e.getMessage());
        }
    }

    private JsonObject readJsonBody(HttpServletRequest req) throws IOException {
        try (BufferedReader reader = req.getReader()) {
            String raw = reader.lines().collect(Collectors.joining());
            if (raw.trim().isEmpty()) return null;
            return JsonUtil.gson().fromJson(raw, JsonObject.class);
        } catch (Exception e) {
            return null;
        }
    }
}
