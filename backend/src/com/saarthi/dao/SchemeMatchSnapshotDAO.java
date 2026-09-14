package com.saarthi.dao;

import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.Set;

/** All SQL for the `scheme_match_snapshot` table lives here — nowhere else. Backs the Notification Trigger Algorithm (Section 5.5). */
public class SchemeMatchSnapshotDAO {

    public Set<Integer> findStrongSchemeIdsByUserId(int userId) throws SQLException {
        String sql = "SELECT scheme_id FROM scheme_match_snapshot WHERE user_id = ? AND confidence = 'STRONG'";
        Set<Integer> ids = new HashSet<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ids.add(rs.getInt("scheme_id"));
                }
            }
        }
        return ids;
    }

    /** Replaces the whole snapshot for a user with the newly-computed STRONG set (Section 5.5 final step). */
    public void replaceSnapshot(int userId, Set<Integer> strongSchemeIds) throws SQLException {
        try (Connection conn = DBUtil.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement del = conn.prepareStatement("DELETE FROM scheme_match_snapshot WHERE user_id = ?")) {
                del.setInt(1, userId);
                del.executeUpdate();
            }
            if (!strongSchemeIds.isEmpty()) {
                String sql = "INSERT INTO scheme_match_snapshot (user_id, scheme_id, confidence) VALUES (?, ?, 'STRONG')";
                try (PreparedStatement ins = conn.prepareStatement(sql)) {
                    for (int schemeId : strongSchemeIds) {
                        ins.setInt(1, userId);
                        ins.setInt(2, schemeId);
                        ins.addBatch();
                    }
                    ins.executeBatch();
                }
            }
            conn.commit();
        }
    }
}
