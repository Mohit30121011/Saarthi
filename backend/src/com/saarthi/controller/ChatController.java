package com.saarthi.controller;

import com.google.gson.JsonObject;
import com.saarthi.service.ChatService;
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
 * Controller layer per SRS Section 2.4 / FR8.12 — no prompt-construction, retrieval,
 * or verification logic here; all of it lives in ChatService. This class only:
 * parse request -> call ChatService -> write JSON. AuthFilter has already populated
 * the "userId" request attribute (chat is behind auth in this release — see
 * RESUME.md for the documented guest-mode scope cut, FR8.3/FR8.6 are not yet wired
 * to an unauthenticated path even though ChatService's method signatures support it).
 *
 * Routes: POST /api/chat/message, GET /api/chat/history.
 */
@WebServlet("/api/chat/*")
public class ChatController extends HttpServlet {

    private final ChatService chatService = new ChatService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        String pathInfo = req.getPathInfo();
        if (pathInfo == null || !pathInfo.equals("/history")) {
            JsonUtil.writeError(resp, 404, "Not found");
            return;
        }
        try {
            List<ChatService.HistoryEntry> history = chatService.getHistory(userId);
            Integer sessionId = chatService.getLatestSessionId(userId);
            JsonUtil.writeJson(resp, 200, new HistoryResponse(sessionId, toMessageResponses(history)));
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        String pathInfo = req.getPathInfo();
        if (pathInfo != null && !pathInfo.equals("/message")) {
            JsonUtil.writeError(resp, 404, "Not found");
            return;
        }

        JsonObject body = readJsonBody(req);
        String message = getString(body, "message");
        if (message == null || message.isBlank()) {
            JsonUtil.writeError(resp, 400, "Message is required.");
            return;
        }
        Integer sessionId = body != null && body.has("sessionId") && !body.get("sessionId").isJsonNull()
                ? body.get("sessionId").getAsInt() : null;

        try {
            ChatService.ChatReply reply = chatService.handleMessage(userId, sessionId, message);
            JsonUtil.writeJson(resp, 200, toMessageResult(reply));
        } catch (Exception e) {
            e.printStackTrace();
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    private List<MessageResponse> toMessageResponses(List<ChatService.HistoryEntry> messages) {
        return messages.stream()
                .map(m -> new MessageResponse(m.sender, m.message, toSchemeCardResponses(m.schemes), m.createdAt))
                .collect(Collectors.toList());
    }

    private MessageResult toMessageResult(ChatService.ChatReply reply) {
        return new MessageResult(reply.sessionId, reply.reply, toSchemeCardResponses(reply.schemes), reply.limitReached);
    }

    private List<SchemeCardResponse> toSchemeCardResponses(List<ChatService.SchemeCard> schemes) {
        return schemes.stream().map(s -> new SchemeCardResponse(
                s.schemeId, s.name, s.ministry, s.categoryName, s.state, s.benefitSummary,
                s.benefitAmount, s.deadline, s.verifiedAt, s.eligibilityVerdict
        )).collect(Collectors.toList());
    }

    private String getString(JsonObject obj, String key) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return null;
        return obj.get(key).getAsString();
    }

    private JsonObject readJsonBody(HttpServletRequest req) throws IOException {
        try (BufferedReader reader = req.getReader()) {
            String raw = reader.lines().collect(Collectors.joining());
            if (raw.isBlank()) return null;
            return JsonUtil.gson().fromJson(raw, JsonObject.class);
        }
    }

    private static final class HistoryResponse {
        public final Integer sessionId;
        public final List<MessageResponse> messages;
        HistoryResponse(Integer sessionId, List<MessageResponse> messages) {
            this.sessionId = sessionId;
            this.messages = messages;
        }
    }

    private static final class MessageResponse {
        public final String sender;
        public final String message;
        public final List<SchemeCardResponse> schemes;
        public final String createdAt;
        MessageResponse(String sender, String message, List<SchemeCardResponse> schemes, String createdAt) {
            this.sender = sender;
            this.message = message;
            this.schemes = schemes;
            this.createdAt = createdAt;
        }
    }

    private static final class MessageResult {
        public final Integer sessionId;
        public final String reply;
        public final List<SchemeCardResponse> schemes;
        public final boolean limitReached;
        MessageResult(Integer sessionId, String reply, List<SchemeCardResponse> schemes, boolean limitReached) {
            this.sessionId = sessionId;
            this.reply = reply;
            this.schemes = schemes;
            this.limitReached = limitReached;
        }
    }

    private static final class SchemeCardResponse {
        public final int schemeId;
        public final String name;
        public final String ministry;
        public final String categoryName;
        public final String state;
        public final String benefitSummary;
        public final String benefitAmount;
        public final String deadline;
        public final String verifiedAt;
        public final String eligibilityVerdict;

        SchemeCardResponse(int schemeId, String name, String ministry, String categoryName, String state,
                            String benefitSummary, String benefitAmount, String deadline, String verifiedAt,
                            String eligibilityVerdict) {
            this.schemeId = schemeId;
            this.name = name;
            this.ministry = ministry;
            this.categoryName = categoryName;
            this.state = state;
            this.benefitSummary = benefitSummary;
            this.benefitAmount = benefitAmount;
            this.deadline = deadline;
            this.verifiedAt = verifiedAt;
            this.eligibilityVerdict = eligibilityVerdict;
        }
    }
}
