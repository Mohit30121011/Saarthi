package com.saarthi.controller;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.saarthi.dao.SchemeReportDAO;
import com.saarthi.model.SchemeReport;
import com.saarthi.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

/**
 * Controller for Feature 14: Report Outdated Scheme.
 * Handles citizen submission at /api/reports, and admin review at /api/admin/reports.
 */
@WebServlet({"/api/reports", "/api/reports/*", "/api/admin/reports", "/api/admin/reports/*"})
public class SchemeReportController extends HttpServlet {

    private final SchemeReportDAO reportDAO = new SchemeReportDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getServletPath() + (req.getPathInfo() != null ? req.getPathInfo() : "");

        // Admin listing endpoint
        if (path.startsWith("/api/admin/reports")) {
            String status = req.getParameter("status");
            try {
                List<SchemeReport> reports = reportDAO.listReports(status);
                JsonUtil.writeJson(resp, 200, reports);
            } catch (SQLException e) {
                JsonUtil.writeError(resp, 500, "Failed to retrieve scheme reports: " + e.getMessage());
            }
        } else {
            JsonUtil.writeError(resp, 404, "Not found");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getServletPath() + (req.getPathInfo() != null ? req.getPathInfo() : "");

        if (path.startsWith("/api/admin/reports/")) {
            handleAdminUpdate(req, resp);
            return;
        }

        if (path.equals("/api/reports") || path.equals("/api/reports/")) {
            handleCitizenSubmit(req, resp);
            return;
        }

        JsonUtil.writeError(resp, 404, "Not found");
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        handleAdminUpdate(req, resp);
    }

    private void handleCitizenSubmit(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        JsonObject body = readJsonBody(req);
        if (body == null) {
            JsonUtil.writeError(resp, 400, "Missing JSON request body.");
            return;
        }

        if (!body.has("schemeId") || body.get("schemeId").getAsInt() <= 0) {
            JsonUtil.writeError(resp, 400, "Valid schemeId is required.");
            return;
        }

        int schemeId = body.get("schemeId").getAsInt();
        String reason = body.has("reason") ? body.get("reason").getAsString() : "OTHER";
        String reasonLabel = body.has("reasonLabel") ? body.get("reasonLabel").getAsString() : formatReasonLabel(reason);
        String details = body.has("details") && !body.get("details").isJsonNull() ? body.get("details").getAsString() : "";

        Object uidAttr = req.getAttribute("userId");
        Integer userId = (uidAttr instanceof Integer && (Integer) uidAttr > 0) ? (Integer) uidAttr : null;

        SchemeReport report = new SchemeReport();
        report.setSchemeId(schemeId);
        report.setUserId(userId);
        report.setReason(reason);
        report.setReasonLabel(reasonLabel);
        report.setDetails(details);

        try {
            SchemeReport created = reportDAO.createReport(report);
            JsonUtil.writeJson(resp, 201, created);
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "Failed to record scheme report: " + e.getMessage());
        }
    }

    private void handleAdminUpdate(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.equals("/")) {
            JsonUtil.writeError(resp, 400, "Missing reportId in path.");
            return;
        }

        String idStr = pathInfo.replaceAll("^/", "").split("/")[0];
        int reportId;
        try {
            reportId = Integer.parseInt(idStr);
        } catch (NumberFormatException e) {
            JsonUtil.writeError(resp, 400, "Invalid reportId: " + idStr);
            return;
        }

        Object uidAttr = req.getAttribute("userId");
        int adminUserId = (uidAttr instanceof Integer) ? (Integer) uidAttr : 1;

        JsonObject body = readJsonBody(req);
        String status = (body != null && body.has("status")) ? body.get("status").getAsString() : "RESOLVED";
        String adminNotes = (body != null && body.has("adminNotes")) ? body.get("adminNotes").getAsString() : "";

        try {
            boolean updated = reportDAO.updateStatus(reportId, adminUserId, status, adminNotes);
            if (updated) {
                JsonObject res = new JsonObject();
                res.addProperty("success", true);
                res.addProperty("reportId", reportId);
                res.addProperty("status", status);
                JsonUtil.writeJson(resp, 200, res);
            } else {
                JsonUtil.writeError(resp, 404, "Report not found or update failed.");
            }
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "Database update error: " + e.getMessage());
        }
    }

    private String formatReasonLabel(String reason) {
        switch (reason) {
            case "DEADLINE_INCORRECT":
                return "Deadline appears incorrect";
            case "ELIGIBILITY_CHANGED":
                return "Eligibility information changed";
            case "LINK_NOT_WORKING":
                return "Application link not working";
            case "OTHER":
            default:
                return "Other issue";
        }
    }

    private JsonObject readJsonBody(HttpServletRequest req) {
        try (BufferedReader reader = req.getReader()) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            if (sb.length() == 0) return null;
            return JsonParser.parseString(sb.toString()).getAsJsonObject();
        } catch (Exception e) {
            return null;
        }
    }
}
