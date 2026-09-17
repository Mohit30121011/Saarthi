package com.saarthi.filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Frontend (Vercel) and backend (Render) are on different origins in production,
 * unlike the old single-WAR same-origin setup. Allowed origin(s) come from the
 * ALLOWED_ORIGIN env var (comma-separated) so the deployed frontend URL isn't
 * hardcoded; falls back to "*" for local dev.
 */
@WebFilter("/api/*")
public class CorsFilter implements Filter {

    private String[] allowedOrigins;

    @Override
    public void init(FilterConfig filterConfig) {
        String configured = System.getenv("ALLOWED_ORIGIN");
        allowedOrigins = (configured == null || configured.isBlank())
                ? new String[] { "*" }
                : configured.split(",");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String origin = req.getHeader("Origin");
        String allowOrigin = "*";
        for (String candidate : allowedOrigins) {
            if (candidate.trim().equals("*")) {
                allowOrigin = "*";
                break;
            }
            if (candidate.trim().equals(origin)) {
                allowOrigin = origin;
                break;
            }
        }
        resp.setHeader("Access-Control-Allow-Origin", allowOrigin);
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            resp.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}
