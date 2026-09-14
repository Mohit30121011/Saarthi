package com.saarthi.controller;

import com.google.gson.JsonObject;
import com.saarthi.service.ChecklistService;
import com.saarthi.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller layer per SRS Section 2.4 — no SQL, no business logic.
 * AuthFilter has already populated "userId" (FR6.1/FR6.3).
 */
@WebServlet({"/api/checklist", "/api/checklist/toggle"})
public class ChecklistController extends HttpServlet {

    private final ChecklistService checklistService = new ChecklistService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        try {
            Map<String, List<ChecklistService.ChecklistItem>> checklist = checklistService.getChecklist(userId);
            JsonUtil.writeJson(resp, 200, checklist);
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    /** FR6.3 — toggle a checklist item's checked state. */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        JsonObject body = readJsonBody(req);

        if (body == null || !body.has("documentName") || !body.has("checked")) {
            JsonUtil.writeError(resp, 400, "documentName and checked are required.");
            return;
        }
        String documentName = body.get("documentName").getAsString();
        boolean checked = body.get("checked").getAsBoolean();

        try {
            checklistService.setChecked(userId, documentName, checked);
            JsonUtil.writeJson(resp, 200, checklistService.getChecklist(userId));
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    private JsonObject readJsonBody(HttpServletRequest req) throws IOException {
        try (BufferedReader reader = req.getReader()) {
            String raw = reader.lines().collect(Collectors.joining());
            return JsonUtil.gson().fromJson(raw, JsonObject.class);
        }
    }
}
