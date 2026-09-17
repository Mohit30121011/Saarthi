package com.saarthi.controller;

import com.saarthi.model.Scheme;
import com.saarthi.model.SchemeMatch;
import com.saarthi.service.EligibilityService;
import com.saarthi.service.NotificationService;
import com.saarthi.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller layer per SRS Section 2.4 — no SQL, no business logic. Only:
 * parse request -> call Service -> write JSON. AuthFilter has already
 * populated the "userId" request attribute (FR3.1, FR3.4).
 */
@WebServlet({"/api/match/my-schemes", "/api/match/refresh"})
public class MatchController extends HttpServlet {

    private final EligibilityService eligibilityService = new EligibilityService();
    private final NotificationService notificationService = new NotificationService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        handle(req, resp);
    }

    /** FR3.4 — "refresh matches" is the same computation as the initial load; nothing is cached. */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        handle(req, resp);
    }

    private void handle(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        try {
            List<SchemeMatch> matches = eligibilityService.getPersonalizedMatches(userId);
            // FR10.1/FR10.2 — no scheduler in this stack, so both notification checks piggyback on every dashboard load/refresh.
            notificationService.runMatchSnapshotDiff(userId, matches);
            notificationService.checkDeadlineProximity(userId, matches);
            JsonUtil.writeJson(resp, 200, toDashboardResponse(matches));
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    /** FR3.2 — total match count + schemes grouped by category. */
    private DashboardResponse toDashboardResponse(List<SchemeMatch> matches) {
        List<MatchResponse> flat = matches.stream().map(this::toMatchResponse).collect(Collectors.toList());

        Map<String, List<MatchResponse>> byCategory = new LinkedHashMap<>();
        for (MatchResponse m : flat) {
            byCategory.computeIfAbsent(m.scheme.categoryName, k -> new java.util.ArrayList<>()).add(m);
        }
        return new DashboardResponse(flat.size(), byCategory);
    }

    private MatchResponse toMatchResponse(SchemeMatch match) {
        return new MatchResponse(toSchemeSummary(match.getScheme()), match.getConfidence().name(), match.getMissingFields());
    }

    private SchemeSummary toSchemeSummary(Scheme s) {
        return new SchemeSummary(
                s.getSchemeId(), s.getName(), s.getMinistry(), s.getCategoryName(), s.getState(),
                s.getBenefitSummary(), s.getBenefitAmount(),
                s.getDeadline() == null ? null : s.getDeadline().toString(),
                s.getVerifiedAt() == null ? null : s.getVerifiedAt().toString()
        );
    }

    private static final class DashboardResponse {
        public final int totalMatches;
        public final Map<String, List<MatchResponse>> byCategory;

        DashboardResponse(int totalMatches, Map<String, List<MatchResponse>> byCategory) {
            this.totalMatches = totalMatches;
            this.byCategory = byCategory;
        }
    }

    private static final class MatchResponse {
        public final SchemeSummary scheme;
        public final String confidence;
        public final List<String> missingFields;

        MatchResponse(SchemeSummary scheme, String confidence, List<String> missingFields) {
            this.scheme = scheme;
            this.confidence = confidence;
            this.missingFields = missingFields;
        }
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
        public final String verifiedAt;

        SchemeSummary(int schemeId, String name, String ministry, String categoryName, String state,
                      String benefitSummary, String benefitAmount, String deadline, String verifiedAt) {
            this.schemeId = schemeId;
            this.name = name;
            this.ministry = ministry;
            this.categoryName = categoryName;
            this.state = state;
            this.benefitSummary = benefitSummary;
            this.benefitAmount = benefitAmount;
            this.deadline = deadline;
            this.verifiedAt = verifiedAt;
        }
    }
}
