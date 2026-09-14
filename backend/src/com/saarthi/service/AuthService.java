package com.saarthi.service;

import com.saarthi.dao.UserDAO;
import com.saarthi.model.User;
import com.saarthi.util.JwtUtil;
import com.saarthi.util.PasswordUtil;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Optional;

/**
 * All auth business logic lives here (FR1.1-FR1.9) — Controllers only call
 * into this class and serialize whatever it returns.
 */
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;      // FR1.8
    private static final long LOCKOUT_MINUTES = 15;

    private final UserDAO userDAO = new UserDAO();

    public static class AuthResult {
        public final boolean success;
        public final String errorMessage;
        public final String token;
        public final User user;

        private AuthResult(boolean success, String errorMessage, String token, User user) {
            this.success = success;
            this.errorMessage = errorMessage;
            this.token = token;
            this.user = user;
        }

        static AuthResult ok(String token, User user) { return new AuthResult(true, null, token, user); }
        static AuthResult fail(String message) { return new AuthResult(false, message, null, null); }
    }

    /** FR1.1/FR1.2 */
    public AuthResult register(String email, String password, String fullName) throws SQLException {
        if (userDAO.findByEmail(email).isPresent()) {
            return AuthResult.fail("An account with this email already exists.");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(PasswordUtil.hash(password));
        user.setFullName(fullName);
        user.setRole("USER");
        userDAO.insert(user);
        String token = JwtUtil.issueToken(user.getUserId(), user.getRole());
        return AuthResult.ok(token, user);
    }

    /** FR1.4/FR1.7/FR1.8 */
    public AuthResult login(String email, String password) throws SQLException {
        Optional<User> maybeUser = userDAO.findByEmail(email);
        if (!maybeUser.isPresent()) {
            return AuthResult.fail("Incorrect email or password.");
        }
        User user = maybeUser.get();

        if ("LOCKED".equals(user.getStatus()) && user.getLockedUntil() != null
                && user.getLockedUntil().isAfter(java.time.LocalDateTime.now())) {
            long minutesLeft = java.time.Duration.between(java.time.LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
            return AuthResult.fail("Too many attempts. Try again in " + minutesLeft + " minutes.");
        }

        if (!PasswordUtil.verify(password, user.getPasswordHash())) {
            int newCount = user.getFailedLoginCount() + 1;
            Timestamp lockedUntil = null;
            if (newCount >= MAX_FAILED_ATTEMPTS) {
                lockedUntil = Timestamp.valueOf(java.time.LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
            }
            userDAO.recordFailedLogin(user.getUserId(), newCount, lockedUntil);
            return AuthResult.fail("Incorrect email or password.");
        }

        userDAO.recordSuccessfulLogin(user.getUserId());
        String token = JwtUtil.issueToken(user.getUserId(), user.getRole());
        return AuthResult.ok(token, user);
    }
}
