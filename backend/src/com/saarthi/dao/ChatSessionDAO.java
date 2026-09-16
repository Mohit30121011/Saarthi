package com.saarthi.dao;

import com.saarthi.model.ChatSession;
import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.Optional;

/** All SQL for the `chat_sessions` table lives here — nowhere else. */
public class ChatSessionDAO {

    /** Most recently active session for a citizen, if any (FR8.10 — resume prior conversation). */
    public Optional<ChatSession> findLatestByUser(int userId) throws SQLException {
        String sql = "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY last_message_at DESC LIMIT 1";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        }
    }

    public Optional<ChatSession> findByIdForUser(int sessionId, int userId) throws SQLException {
        String sql = "SELECT * FROM chat_sessions WHERE session_id = ? AND user_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, sessionId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        }
    }

    public ChatSession create(int userId) throws SQLException {
        String sql = "INSERT INTO chat_sessions (user_id) VALUES (?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, userId);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return findByIdForUser(keys.getInt(1), userId)
                            .orElseThrow(() -> new SQLException("Failed to reload newly created chat session."));
                }
            }
            throw new SQLException("Insert into chat_sessions did not return a generated key.");
        }
    }

    /**
     * FR8.11 — atomically (best-effort; single JDBC connection per request, no pooling
     * per the platform's documented NFR) checks and increments the daily message count,
     * resetting it first if the session's last activity wasn't today. Returns false if
     * the citizen has already hit chat.daily.message.limit for today.
     */
    public boolean tryConsumeMessage(int sessionId, int dailyLimit) throws SQLException {
        String selectSql = "SELECT message_count_today, last_message_at FROM chat_sessions WHERE session_id = ? FOR UPDATE";
        String updateSql = "UPDATE chat_sessions SET message_count_today = ?, last_message_at = CURRENT_TIMESTAMP WHERE session_id = ?";
        try (Connection conn = DBUtil.getConnection()) {
            conn.setAutoCommit(false);
            try {
                int currentCount;
                try (PreparedStatement select = conn.prepareStatement(selectSql)) {
                    select.setInt(1, sessionId);
                    try (ResultSet rs = select.executeQuery()) {
                        if (!rs.next()) {
                            conn.rollback();
                            return false;
                        }
                        int countToday = rs.getInt("message_count_today");
                        Timestamp lastMessageAt = rs.getTimestamp("last_message_at");
                        boolean isNewDay = lastMessageAt == null || !lastMessageAt.toLocalDateTime().toLocalDate().isEqual(LocalDate.now());
                        currentCount = isNewDay ? 0 : countToday;
                    }
                }
                if (currentCount >= dailyLimit) {
                    conn.rollback();
                    return false;
                }
                try (PreparedStatement update = conn.prepareStatement(updateSql)) {
                    update.setInt(1, currentCount + 1);
                    update.setInt(2, sessionId);
                    update.executeUpdate();
                }
                conn.commit();
                return true;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
        }
    }

    private ChatSession mapRow(ResultSet rs) throws SQLException {
        ChatSession s = new ChatSession();
        s.setSessionId(rs.getInt("session_id"));
        s.setUserId(rs.getInt("user_id"));
        Timestamp startedAt = rs.getTimestamp("started_at");
        if (startedAt != null) s.setStartedAt(startedAt.toLocalDateTime());
        Timestamp lastMessageAt = rs.getTimestamp("last_message_at");
        if (lastMessageAt != null) s.setLastMessageAt(lastMessageAt.toLocalDateTime());
        s.setMessageCountToday(rs.getInt("message_count_today"));
        return s;
    }
}
