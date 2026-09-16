package com.saarthi.dao;

import com.saarthi.model.ChatMessage;
import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/** All SQL for the `chat_history` table lives here — nowhere else. */
public class ChatHistoryDAO {

    public int insert(int sessionId, String sender, String message, String contextSchemeIds, String flaggedUnverifiedMentions) throws SQLException {
        String sql = "INSERT INTO chat_history (session_id, sender, message, context_scheme_ids, flagged_unverified_mentions) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, sessionId);
            ps.setString(2, sender);
            ps.setString(3, message);
            ps.setString(4, contextSchemeIds);
            ps.setString(5, flaggedUnverifiedMentions);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
            throw new SQLException("Insert into chat_history did not return a generated key.");
        }
    }

    /** Full transcript for one session, oldest first — used both to resume a conversation (FR8.10) and to build recent-turn context for the model (Section 5.6). */
    public List<ChatMessage> findBySession(int sessionId) throws SQLException {
        String sql = "SELECT * FROM chat_history WHERE session_id = ? ORDER BY created_at ASC, message_id ASC";
        List<ChatMessage> messages = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, sessionId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    messages.add(mapRow(rs));
                }
            }
        }
        return messages;
    }

    private ChatMessage mapRow(ResultSet rs) throws SQLException {
        ChatMessage m = new ChatMessage();
        m.setMessageId(rs.getInt("message_id"));
        m.setSessionId(rs.getInt("session_id"));
        m.setSender(rs.getString("sender"));
        m.setMessage(rs.getString("message"));
        m.setContextSchemeIds(rs.getString("context_scheme_ids"));
        m.setFlaggedUnverifiedMentions(rs.getString("flagged_unverified_mentions"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) m.setCreatedAt(createdAt.toLocalDateTime());
        return m;
    }
}
