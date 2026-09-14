package com.saarthi.controller;

import com.google.gson.JsonObject;
import com.saarthi.model.Scheme;
import com.saarthi.service.BookmarkService;
import com.saarthi.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller layer per SRS Section 2.4 — no SQL, no business logic.
 * AuthFilter has already populated "userId" (FR7.1-FR7.3).
 */
@WebServlet({"/api/bookmarks", "/api/bookmarks/*"})
public class BookmarkController extends HttpServlet {

    private final BookmarkService bookmarkService = new BookmarkService();

    /** FR7.3 */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        try {
            List<Scheme> schemes = bookmarkService.getBookmarkedSchemes(userId);
            List<SchemeSummary> summaries = schemes.stream().map(this::toSummary).collect(Collectors.toList());
            JsonUtil.writeJson(resp, 200, summaries);
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    /** FR7.1 — bookmark a scheme; body: { schemeId }. */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        JsonObject body = readJsonBody(req);
        if (body == null || !body.has("schemeId")) {
            JsonUtil.writeError(resp, 400, "schemeId is required.");
            return;
        }
        int schemeId = body.get("schemeId").getAsInt();

        try {
            boolean added = bookmarkService.addBookmark(userId, schemeId);
            if (!added) {
                JsonUtil.writeError(resp, 409, "Scheme not found, or already bookmarked.");
                return;
            }
            JsonUtil.writeJson(resp, 201, new StatusResponse(true));
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    /** FR7.1 — un-bookmark; path: /api/bookmarks/{schemeId}. */
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        String pathInfo = req.getPathInfo();
        int schemeId;
        try {
            schemeId = Integer.parseInt(pathInfo.substring(1));
        } catch (Exception e) {
            JsonUtil.writeError(resp, 400, "Invalid scheme id.");
            return;
        }

        try {
            bookmarkService.removeBookmark(userId, schemeId);
            JsonUtil.writeJson(resp, 200, new StatusResponse(true));
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    private SchemeSummary toSummary(Scheme s) {
        return new SchemeSummary(
                s.getSchemeId(), s.getName(), s.getMinistry(), s.getCategoryName(), s.getState(),
                s.getBenefitSummary(), s.getBenefitAmount(),
                s.getDeadline() == null ? null : s.getDeadline().toString()
        );
    }

    private JsonObject readJsonBody(HttpServletRequest req) throws IOException {
        try (BufferedReader reader = req.getReader()) {
            String raw = reader.lines().collect(Collectors.joining());
            return JsonUtil.gson().fromJson(raw, JsonObject.class);
        }
    }

    private static final class StatusResponse {
        public final boolean success;
        StatusResponse(boolean success) { this.success = success; }
    }

    private static final class SchemeSummary {
        public final int schemeId;
        public final String name;
        public final String ministry;
        public final String categoryName;
        public final String state;
        public final String benefitSummary;
        public final String benefitAmount;
        public final String deadline;

        SchemeSummary(int schemeId, String name, String ministry, String categoryName, String state,
                      String benefitSummary, String benefitAmount, String deadline) {
            this.schemeId = schemeId;
            this.name = name;
            this.ministry = ministry;
            this.categoryName = categoryName;
            this.state = state;
            this.benefitSummary = benefitSummary;
            this.benefitAmount = benefitAmount;
            this.deadline = deadline;
        }
    }
}
