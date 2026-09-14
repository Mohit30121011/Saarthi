package com.saarthi.controller;

import com.google.gson.JsonObject;
import com.saarthi.model.EligibilityRule;
import com.saarthi.model.RequiredDocument;
import com.saarthi.model.Scheme;
import com.saarthi.service.AdminService;
import com.saarthi.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller layer per SRS Section 2.4 — no SQL, no business logic.
 * ADMIN-only (FR9.5, enforced by AuthFilter for the whole /api/admin/* prefix).
 * Routes: POST/PUT/DELETE /api/admin/schemes[/{id}], .../schemes/{id}/rules,
 * .../rules/{id}, .../schemes/{id}/documents, .../documents/{id}.
 */
@WebServlet("/api/admin/*")
public class AdminController extends HttpServlet {

    private final AdminService adminService = new AdminService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        int actorUserId = (int) req.getAttribute("userId");
        String[] parts = splitPath(req);
        JsonObject body = readJsonBody(req);

        try {
            if (parts.length == 1 && parts[0].equals("schemes")) {
                Scheme created = adminService.createScheme(actorUserId, schemeFromBody(body));
                JsonUtil.writeJson(resp, 201, toSchemeResponse(created));
            } else if (parts.length == 3 && parts[0].equals("schemes") && parts[2].equals("rules")) {
                int schemeId = parseId(parts[1]);
                EligibilityRule created = adminService.addRule(actorUserId, schemeId, ruleFromBody(body));
                JsonUtil.writeJson(resp, 201, toRuleResponse(created));
            } else if (parts.length == 3 && parts[0].equals("schemes") && parts[2].equals("documents")) {
                int schemeId = parseId(parts[1]);
                RequiredDocument created = adminService.addDocument(actorUserId, schemeId, documentFromBody(body));
                JsonUtil.writeJson(resp, 201, toDocumentResponse(created));
            } else {
                JsonUtil.writeError(resp, 404, "Not found");
            }
        } catch (NumberFormatException e) {
            JsonUtil.writeError(resp, 400, "Invalid id.");
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        int actorUserId = (int) req.getAttribute("userId");
        String[] parts = splitPath(req);
        JsonObject body = readJsonBody(req);

        try {
            if (parts.length == 2 && parts[0].equals("schemes")) {
                int schemeId = parseId(parts[1]);
                Optional<Scheme> updated = adminService.updateScheme(actorUserId, schemeId, schemeFromBody(body));
                writeOptional(resp, updated.map(this::toSchemeResponse), "Scheme not found.");
            } else if (parts.length == 2 && parts[0].equals("rules")) {
                int ruleId = parseId(parts[1]);
                Optional<EligibilityRule> updated = adminService.updateRule(actorUserId, ruleId, ruleFromBody(body));
                writeOptional(resp, updated.map(this::toRuleResponse), "Rule not found.");
            } else if (parts.length == 2 && parts[0].equals("documents")) {
                int docId = parseId(parts[1]);
                Optional<RequiredDocument> updated = adminService.updateDocument(actorUserId, docId, documentFromBody(body));
                writeOptional(resp, updated.map(this::toDocumentResponse), "Document not found.");
            } else {
                JsonUtil.writeError(resp, 404, "Not found");
            }
        } catch (NumberFormatException e) {
            JsonUtil.writeError(resp, 400, "Invalid id.");
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    /** FR9.1 — scheme delete is a soft-delete (is_active=false); rules/documents are hard-deleted. */
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int actorUserId = (int) req.getAttribute("userId");
        String[] parts = splitPath(req);

        try {
            if (parts.length == 2 && parts[0].equals("schemes")) {
                int schemeId = parseId(parts[1]);
                Optional<Scheme> deactivated = adminService.deactivateScheme(actorUserId, schemeId);
                writeOptional(resp, deactivated.map(this::toSchemeResponse), "Scheme not found.");
            } else if (parts.length == 2 && parts[0].equals("rules")) {
                int ruleId = parseId(parts[1]);
                boolean deleted = adminService.deleteRule(actorUserId, ruleId);
                writeDeleted(resp, deleted, "Rule not found.");
            } else if (parts.length == 2 && parts[0].equals("documents")) {
                int docId = parseId(parts[1]);
                boolean deleted = adminService.deleteDocument(actorUserId, docId);
                writeDeleted(resp, deleted, "Document not found.");
            } else {
                JsonUtil.writeError(resp, 404, "Not found");
            }
        } catch (NumberFormatException e) {
            JsonUtil.writeError(resp, 400, "Invalid id.");
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    private String[] splitPath(HttpServletRequest req) {
        String pathInfo = req.getPathInfo(); // e.g. "/schemes/5/rules"
        if (pathInfo == null || pathInfo.equals("/")) return new String[0];
        String trimmed = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;
        return trimmed.split("/");
    }

    private int parseId(String s) {
        return Integer.parseInt(s);
    }

    private void writeOptional(HttpServletResponse resp, Optional<?> result, String notFoundMessage) throws IOException {
        if (!result.isPresent()) {
            JsonUtil.writeError(resp, 404, notFoundMessage);
            return;
        }
        JsonUtil.writeJson(resp, 200, result.get());
    }

    private void writeDeleted(HttpServletResponse resp, boolean deleted, String notFoundMessage) throws IOException {
        if (!deleted) {
            JsonUtil.writeError(resp, 404, notFoundMessage);
            return;
        }
        JsonUtil.writeJson(resp, 200, new StatusResponse(true));
    }

    private Scheme schemeFromBody(JsonObject body) {
        Scheme s = new Scheme();
        s.setName(getString(body, "name"));
        s.setDescription(getString(body, "description"));
        s.setMinistry(getString(body, "ministry"));
        s.setCategoryId(getInt(body, "categoryId", 0));
        s.setState(getString(body, "state"));
        s.setBenefitSummary(getString(body, "benefitSummary"));
        s.setBenefitAmount(getString(body, "benefitAmount"));
        s.setApplicationUrl(getString(body, "applicationUrl"));
        s.setOfficialPortal(getString(body, "officialPortal"));
        s.setActive(getBoolean(body, "isActive", true));
        String deadline = getString(body, "deadline");
        if (deadline != null) s.setDeadline(LocalDate.parse(deadline));
        s.setSourceUrl(getString(body, "sourceUrl"));
        String verifiedAt = getString(body, "verifiedAt");
        if (verifiedAt != null) s.setVerifiedAt(LocalDate.parse(verifiedAt));
        return s;
    }

    private EligibilityRule ruleFromBody(JsonObject body) {
        EligibilityRule r = new EligibilityRule();
        r.setAttributeName(getString(body, "attributeName"));
        r.setOperator(getString(body, "operator"));
        r.setValue(getString(body, "value"));
        r.setRuleDescription(getString(body, "ruleDescription"));
        r.setSourceTextSnippet(getString(body, "sourceTextSnippet"));
        return r;
    }

    private RequiredDocument documentFromBody(JsonObject body) {
        RequiredDocument d = new RequiredDocument();
        d.setDocumentName(getString(body, "documentName"));
        d.setDocumentCategory(getString(body, "documentCategory"));
        d.setMandatory(getBoolean(body, "mandatory", true));
        return d;
    }

    private String getString(JsonObject obj, String key) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return null;
        String v = obj.get(key).getAsString();
        return v.trim().isEmpty() ? null : v.trim();
    }

    private int getInt(JsonObject obj, String key, int defaultValue) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return defaultValue;
        return obj.get(key).getAsInt();
    }

    private boolean getBoolean(JsonObject obj, String key, boolean defaultValue) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return defaultValue;
        return obj.get(key).getAsBoolean();
    }

    /** Gson can't reflect into java.time.* on modern JDKs (module access restrictions), so every response is a plain DTO — never the raw model. */
    private SchemeResponse toSchemeResponse(Scheme s) {
        return new SchemeResponse(
                s.getSchemeId(), s.getName(), s.getDescription(), s.getMinistry(), s.getCategoryId(),
                s.getState(), s.getBenefitSummary(), s.getBenefitAmount(), s.getApplicationUrl(),
                s.getOfficialPortal(), s.isActive(), s.getDeadline() == null ? null : s.getDeadline().toString(),
                s.getSourceUrl(), s.getVerifiedAt() == null ? null : s.getVerifiedAt().toString()
        );
    }

    private RuleResponse toRuleResponse(EligibilityRule r) {
        return new RuleResponse(r.getRuleId(), r.getSchemeId(), r.getAttributeName(), r.getOperator(), r.getValue(),
                r.getRuleDescription(), r.getSourceTextSnippet());
    }

    private DocumentResponse toDocumentResponse(RequiredDocument d) {
        return new DocumentResponse(d.getDocId(), d.getSchemeId(), d.getDocumentName(), d.getDocumentCategory(), d.isMandatory());
    }

    private static final class SchemeResponse {
        public final int schemeId;
        public final String name;
        public final String description;
        public final String ministry;
        public final int categoryId;
        public final String state;
        public final String benefitSummary;
        public final String benefitAmount;
        public final String applicationUrl;
        public final String officialPortal;
        public final boolean isActive;
        public final String deadline;
        public final String sourceUrl;
        public final String verifiedAt;

        SchemeResponse(int schemeId, String name, String description, String ministry, int categoryId, String state,
                       String benefitSummary, String benefitAmount, String applicationUrl, String officialPortal,
                       boolean isActive, String deadline, String sourceUrl, String verifiedAt) {
            this.schemeId = schemeId;
            this.name = name;
            this.description = description;
            this.ministry = ministry;
            this.categoryId = categoryId;
            this.state = state;
            this.benefitSummary = benefitSummary;
            this.benefitAmount = benefitAmount;
            this.applicationUrl = applicationUrl;
            this.officialPortal = officialPortal;
            this.isActive = isActive;
            this.deadline = deadline;
            this.sourceUrl = sourceUrl;
            this.verifiedAt = verifiedAt;
        }
    }

    private static final class RuleResponse {
        public final int ruleId;
        public final int schemeId;
        public final String attributeName;
        public final String operator;
        public final String value;
        public final String ruleDescription;
        public final String sourceTextSnippet;

        RuleResponse(int ruleId, int schemeId, String attributeName, String operator, String value,
                     String ruleDescription, String sourceTextSnippet) {
            this.ruleId = ruleId;
            this.schemeId = schemeId;
            this.attributeName = attributeName;
            this.operator = operator;
            this.value = value;
            this.ruleDescription = ruleDescription;
            this.sourceTextSnippet = sourceTextSnippet;
        }
    }

    private static final class DocumentResponse {
        public final int docId;
        public final int schemeId;
        public final String documentName;
        public final String documentCategory;
        public final boolean mandatory;

        DocumentResponse(int docId, int schemeId, String documentName, String documentCategory, boolean mandatory) {
            this.docId = docId;
            this.schemeId = schemeId;
            this.documentName = documentName;
            this.documentCategory = documentCategory;
            this.mandatory = mandatory;
        }
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
}
