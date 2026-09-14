package com.saarthi.controller;

import com.google.gson.JsonObject;
import com.saarthi.model.User;
import com.saarthi.service.AuthService;
import com.saarthi.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.sql.SQLException;
import java.util.stream.Collectors;

/**
 * Controller layer per SRS Section 2.4 — no SQL, no POJO construction, no
 * business logic. Only: parse request -> call Service -> write JSON.
 */
@WebServlet({"/api/auth/register", "/api/auth/login"})
public class AuthController extends HttpServlet {

    private final AuthService authService = new AuthService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();
        JsonObject body = readJsonBody(req);

        try {
            if (path.endsWith("/register")) {
                handleRegister(body, resp);
            } else if (path.endsWith("/login")) {
                handleLogin(body, resp);
            } else {
                JsonUtil.writeError(resp, 404, "Not found");
            }
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    private void handleRegister(JsonObject body, HttpServletResponse resp) throws IOException, SQLException {
        String email = getString(body, "email");
        String password = getString(body, "password");
        String fullName = getString(body, "fullName");

        if (email == null || password == null || fullName == null
                || password.length() < 8) {
            JsonUtil.writeError(resp, 400, "Email, full name, and a password of at least 8 characters are required.");
            return;
        }

        AuthService.AuthResult result = authService.register(email, password, fullName);
        if (!result.success) {
            JsonUtil.writeError(resp, 409, result.errorMessage);
            return;
        }
        JsonUtil.writeJson(resp, 201, toAuthResponse(result));
    }

    private void handleLogin(JsonObject body, HttpServletResponse resp) throws IOException, SQLException {
        String email = getString(body, "email");
        String password = getString(body, "password");

        if (email == null || password == null) {
            JsonUtil.writeError(resp, 400, "Email and password are required.");
            return;
        }

        AuthService.AuthResult result = authService.login(email, password);
        if (!result.success) {
            JsonUtil.writeError(resp, 401, result.errorMessage);
            return;
        }
        JsonUtil.writeJson(resp, 200, toAuthResponse(result));
    }

    private AuthResponse toAuthResponse(AuthService.AuthResult result) {
        User u = result.user;
        return new AuthResponse(result.token, u.getUserId(), u.getEmail(), u.getFullName(), u.getRole());
    }

    private static final class AuthResponse {
        public final String token;
        public final int userId;
        public final String email;
        public final String fullName;
        public final String role;

        AuthResponse(String token, int userId, String email, String fullName, String role) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
        }
    }

    private JsonObject readJsonBody(HttpServletRequest req) throws IOException {
        try (BufferedReader reader = req.getReader()) {
            String raw = reader.lines().collect(Collectors.joining());
            return JsonUtil.gson().fromJson(raw, JsonObject.class);
        }
    }

    private String getString(JsonObject obj, String key) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return null;
        String v = obj.get(key).getAsString();
        return v.trim().isEmpty() ? null : v.trim();
    }
}
