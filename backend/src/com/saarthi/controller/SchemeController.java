package com.saarthi.controller;

import com.saarthi.model.EligibilityRule;
import com.saarthi.model.RequiredDocument;
import com.saarthi.model.Scheme;
import com.saarthi.service.SchemeService;
import com.saarthi.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller layer per SRS Section 2.4 — no SQL, no business logic. Publicly
 * browsable (FR4.x/FR5.x — Guests and Citizens both). Only: parse request ->
 * call Service -> write JSON.
 */
@WebServlet({"/api/schemes", "/api/schemes/*"})
public class SchemeController extends HttpServlet {

    private final SchemeService schemeService = new SchemeService();
    private final ReviewController reviewController = new ReviewController();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo != null && (pathInfo.startsWith("/reviews") || pathInfo.startsWith("/rating-summaries"))) {
            reviewController.service(req, resp);
            return;
        }

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                handleSearch(req, resp);
            } else {
                handleDetail(pathInfo, resp);
            }
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo != null && (pathInfo.startsWith("/reviews") || pathInfo.startsWith("/rating-summaries"))) {
            reviewController.service(req, resp);
            return;
        }
        super.doPost(req, resp);
    }

    /** FR4.x — Explorer: filter by category/state and free-text keyword search. */
    private void handleSearch(HttpServletRequest req, HttpServletResponse resp) throws IOException, SQLException {
        String category = emptyToNull(req.getParameter("category"));
        String state = emptyToNull(req.getParameter("state"));
        String keyword = emptyToNull(req.getParameter("q"));

        List<Scheme> schemes = schemeService.search(category, state, keyword);
        List<SchemeSummary> summaries = schemes.stream().map(this::toSummary).collect(Collectors.toList());
        JsonUtil.writeJson(resp, 200, summaries);
    }

    /** FR5.1 — Scheme Detail: full description + the rules and documents behind it. */
    private void handleDetail(String pathInfo, HttpServletResponse resp) throws IOException, SQLException {
        int schemeId;
        try {
            schemeId = Integer.parseInt(pathInfo.substring(1));
        } catch (NumberFormatException e) {
            JsonUtil.writeError(resp, 400, "Invalid scheme id.");
            return;
        }

        Optional<SchemeService.SchemeDetail> detail = schemeService.getDetail(schemeId);
        if (!detail.isPresent()) {
            JsonUtil.writeError(resp, 404, "Scheme not found.");
            return;
        }
        JsonUtil.writeJson(resp, 200, toDetailResponse(detail.get()));
    }

    private String emptyToNull(String s) {
        return (s == null || s.trim().isEmpty()) ? null : s.trim();
    }

    private SchemeSummary toSummary(Scheme s) {
        return new SchemeSummary(
                s.getSchemeId(), s.getName(), s.getMinistry(), s.getCategoryName(), s.getState(),
                s.getBenefitSummary(), s.getBenefitAmount(),
                s.getDeadline() == null ? null : s.getDeadline().toString(),
                s.getVerifiedAt() == null ? null : s.getVerifiedAt().toString()
        );
    }

    private DetailResponse toDetailResponse(SchemeService.SchemeDetail detail) {
        Scheme s = detail.scheme;
        List<RuleResponse> rules = detail.rules.stream()
                .map(r -> new RuleResponse(r.getAttributeName(), r.getOperator(), r.getValue(), r.getRuleDescription()))
                .collect(Collectors.toList());
        List<DocumentResponse> documents = detail.documents.stream()
                .map(d -> new DocumentResponse(d.getDocumentName(), d.getDocumentCategory(), d.isMandatory()))
                .collect(Collectors.toList());

        return new DetailResponse(
                s.getSchemeId(), s.getName(), s.getDescription(), s.getMinistry(), s.getCategoryName(), s.getState(),
                s.getBenefitSummary(), s.getBenefitAmount(), s.getApplicationUrl(), s.getOfficialPortal(),
                s.getDeadline() == null ? null : s.getDeadline().toString(),
                s.getSourceUrl(), s.getVerifiedAt() == null ? null : s.getVerifiedAt().toString(),
                rules, documents
        );
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

    private static final class RuleResponse {
        public final String attributeName;
        public final String operator;
        public final String value;
        public final String ruleDescription;

        RuleResponse(String attributeName, String operator, String value, String ruleDescription) {
            this.attributeName = attributeName;
            this.operator = operator;
            this.value = value;
            this.ruleDescription = ruleDescription;
        }
    }

    private static final class DocumentResponse {
        public final String documentName;
        public final String documentCategory;
        public final boolean mandatory;

        DocumentResponse(String documentName, String documentCategory, boolean mandatory) {
            this.documentName = documentName;
            this.documentCategory = documentCategory;
            this.mandatory = mandatory;
        }
    }

    private static final class DetailResponse {
        public final int schemeId;
        public final String name;
        public final String description;
        public final String ministry;
        public final String categoryName;
        public final String state;
        public final String benefitSummary;
        public final String benefitAmount;
        public final String applicationUrl;
        public final String officialPortal;
        public final String deadline;
        public final String sourceUrl;
        public final String verifiedAt;
        public final List<RuleResponse> rules;
        public final List<DocumentResponse> documents;

        DetailResponse(int schemeId, String name, String description, String ministry, String categoryName,
                        String state, String benefitSummary, String benefitAmount, String applicationUrl,
                        String officialPortal, String deadline, String sourceUrl, String verifiedAt,
                        List<RuleResponse> rules, List<DocumentResponse> documents) {
            this.schemeId = schemeId;
            this.name = name;
            this.description = description;
            this.ministry = ministry;
            this.categoryName = categoryName;
            this.state = state;
            this.benefitSummary = benefitSummary;
            this.benefitAmount = benefitAmount;
            this.applicationUrl = applicationUrl;
            this.officialPortal = officialPortal;
            this.deadline = deadline;
            this.sourceUrl = sourceUrl;
            this.verifiedAt = verifiedAt;
            this.rules = rules;
            this.documents = documents;
        }
    }
}
