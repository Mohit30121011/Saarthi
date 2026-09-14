package com.saarthi.dao;

import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.ArrayList;
import java.util.List;

/** All SQL for the `bookmarks` table lives here — nowhere else. */
public class BookmarkDAO {

    /** FR7.2 — UNIQUE(user_id, scheme_id) at the DB level backs this up; returns false on a duplicate rather than throwing. */
    public boolean insert(int userId, int schemeId) throws SQLException {
        String sql = "INSERT INTO bookmarks (user_id, scheme_id) VALUES (?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, schemeId);
            ps.executeUpdate();
            return true;
        } catch (SQLIntegrityConstraintViolationException e) {
            return false;
        }
    }

    public void delete(int userId, int schemeId) throws SQLException {
        String sql = "DELETE FROM bookmarks WHERE user_id = ? AND scheme_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, schemeId);
            ps.executeUpdate();
        }
    }

    /** FR7.3 — bookmarked scheme ids for one user. */
    public List<Integer> findSchemeIdsByUserId(int userId) throws SQLException {
        String sql = "SELECT scheme_id FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC";
        List<Integer> ids = new ArrayList<>();
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

    public boolean exists(int userId, int schemeId) throws SQLException {
        String sql = "SELECT 1 FROM bookmarks WHERE user_id = ? AND scheme_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, schemeId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }
}
