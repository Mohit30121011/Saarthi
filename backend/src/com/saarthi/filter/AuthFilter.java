package com.saarthi.filter;

import com.saarthi.util.JsonUtil;
import com.saarthi.util.JwtUtil;
import io.jsonwebtoken.Claims;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Validates the Bearer JWT on every /api/* request except the public auth
 * endpoints, and enforces ADMIN-only routes (FR1.7, FR9.5). On success,
 * stores userId/role as request attributes for downstream Controllers.
 */
@WebFilter("/api/*")
public class AuthFilter implements Filter {

    private static final String[] PUBLIC_PATHS = {
            "/api/auth/register", "/api/auth/login", "/api/auth/forgot-password"
    };

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;
        String path = req.getServletPath();

        for (String publicPath : PUBLIC_PATHS) {
            if (path.equals(publicPath)) {
                chain.doFilter(request, response);
                return;
            }
        }
        // FR4.x — Scheme Explorer/Detail is browsable by Guests, not just logged-in citizens.
        if (path.equals("/api/schemes") || path.startsWith("/api/schemes/")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            JsonUtil.writeError(resp, 401, "Missing or invalid Authorization header.");
            return;
        }

        String token = authHeader.substring("Bearer ".length());
        Claims claims = JwtUtil.parseToken(token);
        if (claims == null) {
            JsonUtil.writeError(resp, 401, "Invalid or expired session. Please log in again.");
            return;
        }

        // For a wildcard mapping ("/api/admin/*"), getServletPath() returns just "/api/admin"
        // (no trailing slash) — the rest lives in getPathInfo(). A startsWith("/api/admin/")
        // check here would never match and would silently let any authenticated user through.
        if (path.equals("/api/admin") && !"ADMIN".equals(claims.get("role"))) {
            JsonUtil.writeError(resp, 403, "Admin access required.");
            return;
        }

        request.setAttribute("userId", Integer.parseInt(claims.getSubject()));
        request.setAttribute("role", claims.get("role"));
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}
