package com.saarthi.dao;

import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

/** All SQL for the `checklist_item_state` table lives here — nowhere else. */
public class ChecklistItemStateDAO {

    /** Keyed by normalized document_name for fast lookup while assembling the checklist (FR6.3). */
    public Map<String, Boolean> findCheckedStateByUserId(int userId) throws SQLException {
        String sql = "SELECT document_name, is_checked FROM checklist_item_state WHERE user_id = ?";
        Map<String, Boolean> state = new HashMap<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    state.put(rs.getString("document_name"), rs.getBoolean("is_checked"));
                }
            }
        }
        return state;
    }

    /** FR6.3 — toggle persists across sessions; upsert on (user_id, document_name). */
    public void setChecked(int userId, String normalizedDocumentName, boolean checked) throws SQLException {
        String sql = "INSERT INTO checklist_item_state (user_id, document_name, is_checked) VALUES (?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE is_checked = VALUES(is_checked)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setString(2, normalizedDocumentName);
            ps.setBoolean(3, checked);
            ps.executeUpdate();
        }
    }
}
