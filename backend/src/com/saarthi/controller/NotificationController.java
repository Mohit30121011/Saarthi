package com.saarthi.controller;

import com.saarthi.model.Notification;
import com.saarthi.service.NotificationService;
import com.saarthi.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller layer per SRS Section 2.4 — no SQL, no business logic.
 * AuthFilter has already populated "userId" (FR10.1-FR10.3).
 */
@WebServlet({"/api/notifications", "/api/notifications/*", "/api/notifications/read-all"})
public class NotificationController extends HttpServlet {

    private final NotificationService notificationService = new NotificationService();

    /** FR10.3 — list + unread badge count. */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        try {
            List<Notification> notifications = notificationService.getNotifications(userId);
            List<NotificationResponse> responses = notifications.stream().map(this::toResponse).collect(Collectors.toList());
            int unreadCount = notificationService.countUnread(userId);
            JsonUtil.writeJson(resp, 200, new NotificationListResponse(unreadCount, responses));
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    /** FR10.3 — mark one (/api/notifications/{id}/read) or all (/api/notifications/read-all) as read. */
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        String path = req.getServletPath() + (req.getPathInfo() == null ? "" : req.getPathInfo());

        try {
            if (path.endsWith("/read-all")) {
                notificationService.markAllRead(userId);
                JsonUtil.writeJson(resp, 200, new StatusResponse(true));
                return;
            }
            String pathInfo = req.getPathInfo();
            if (pathInfo != null && pathInfo.endsWith("/read")) {
                String idPart = pathInfo.substring(1, pathInfo.length() - "/read".length());
                int notificationId = Integer.parseInt(idPart);
                notificationService.markRead(userId, notificationId);
                JsonUtil.writeJson(resp, 200, new StatusResponse(true));
                return;
            }
            JsonUtil.writeError(resp, 404, "Not found");
        } catch (NumberFormatException e) {
            JsonUtil.writeError(resp, 400, "Invalid notification id.");
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getNotificationId(), n.getSchemeId(), n.getType(), n.getTitle(), n.getMessage(),
                n.isRead(), n.getCreatedAt() == null ? null : n.getCreatedAt().toString()
        );
    }

    private static final class StatusResponse {
        public final boolean success;
        StatusResponse(boolean success) { this.success = success; }
    }

    private static final class NotificationListResponse {
        public final int unreadCount;
        public final List<NotificationResponse> notifications;

        NotificationListResponse(int unreadCount, List<NotificationResponse> notifications) {
            this.unreadCount = unreadCount;
            this.notifications = notifications;
        }
    }

    private static final class NotificationResponse {
        public final int notificationId;
        public final Integer schemeId;
        public final String type;
        public final String title;
        public final String message;
        public final boolean read;
        public final String createdAt;

        NotificationResponse(int notificationId, Integer schemeId, String type, String title, String message,
                              boolean read, String createdAt) {
            this.notificationId = notificationId;
            this.schemeId = schemeId;
            this.type = type;
            this.title = title;
            this.message = message;
            this.read = read;
            this.createdAt = createdAt;
        }
    }
}
