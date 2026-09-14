package com.saarthi.dao;

import com.saarthi.model.User;
import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Optional;

/** All SQL for the `users` table lives here — nowhere else. */
public class UserDAO {

    public User insert(User user) throws SQLException {
        String sql = "INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getEmail());
            ps.setString(2, user.getPasswordHash());
            ps.setString(3, user.getFullName());
            ps.setString(4, user.getRole() != null ? user.getRole() : "USER");
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    user.setUserId(keys.getInt(1));
                }
            }
            return user;
        }
    }

    public Optional<User> findByEmail(String email) throws SQLException {
        String sql = "SELECT * FROM users WHERE email = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
                return Optional.empty();
            }
        }
    }

    public Optional<User> findById(int userId) throws SQLException {
        String sql = "SELECT * FROM users WHERE user_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
                return Optional.empty();
            }
        }
    }

    /** FR1.8 — increments the failed-attempt counter, locking the account at the 5th. */
    public void recordFailedLogin(int userId, int newFailedCount, Timestamp lockedUntilOrNull) throws SQLException {
        String sql = "UPDATE users SET failed_login_count = ?, locked_until = ?, status = ? WHERE user_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, newFailedCount);
            if (lockedUntilOrNull != null) {
                ps.setTimestamp(2, lockedUntilOrNull);
            } else {
                ps.setNull(2, java.sql.Types.TIMESTAMP);
            }
            ps.setString(3, lockedUntilOrNull != null ? "LOCKED" : "ACTIVE");
            ps.setInt(4, userId);
            ps.executeUpdate();
        }
    }

    public void recordSuccessfulLogin(int userId) throws SQLException {
        String sql = "UPDATE users SET failed_login_count = 0, locked_until = NULL, status = 'ACTIVE', last_login_at = CURRENT_TIMESTAMP WHERE user_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.executeUpdate();
        }
    }

    public void updatePassword(int userId, String newPasswordHash) throws SQLException {
        String sql = "UPDATE users SET password_hash = ? WHERE user_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, newPasswordHash);
            ps.setInt(2, userId);
            ps.executeUpdate();
        }
    }

    private User mapRow(ResultSet rs) throws SQLException {
        User u = new User();
        u.setUserId(rs.getInt("user_id"));
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setFullName(rs.getString("full_name"));
        u.setRole(rs.getString("role"));
        u.setStatus(rs.getString("status"));
        u.setFailedLoginCount(rs.getInt("failed_login_count"));
        Timestamp lockedUntil = rs.getTimestamp("locked_until");
        if (lockedUntil != null) u.setLockedUntil(lockedUntil.toLocalDateTime());
        Timestamp lastLogin = rs.getTimestamp("last_login_at");
        if (lastLogin != null) u.setLastLoginAt(lastLogin.toLocalDateTime());
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) u.setCreatedAt(createdAt.toLocalDateTime());
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) u.setUpdatedAt(updatedAt.toLocalDateTime());
        return u;
    }
}
