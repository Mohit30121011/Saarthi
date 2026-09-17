package com.saarthi.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.security.SecureRandom;
import java.util.Date;

/**
 * JWT issuance/parsing per SRS FR1.4/FR1.5, using jjwt 0.9.1's API
 * (Jwts.builder()/Jwts.parser() — the pre-0.11 API, matching the single jjwt-0.9.1.jar
 * dependency choice documented in PLAN.md).
 *
 * Signing key is generated once per server start for this dev setup; for
 * production this should come from a fixed, externally-configured secret so
 * tokens survive a server restart.
 */
public final class JwtUtil {

    // Fixed persistent secret key so JWTs survive server restarts and work across both ROOT and /Saarthi contexts
    private static final byte[] KEY = "saarthi-national-citizen-welfare-portal-secret-key-2026".getBytes(java.nio.charset.StandardCharsets.UTF_8);

    private static final long EXPIRY_MILLIS = 24L * 60 * 60 * 1000; // 24 hours, per FR1.5

    private JwtUtil() {
    }

    public static String issueToken(int userId, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + EXPIRY_MILLIS);
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS256, KEY)
                .compact();
    }

    /** @return parsed claims, or null if the token is invalid/expired. */
    public static Claims parseToken(String token) {
        try {
            return Jwts.parser().setSigningKey(KEY).parseClaimsJws(token).getBody();
        } catch (Exception e) {
            return null;
        }
    }
}
