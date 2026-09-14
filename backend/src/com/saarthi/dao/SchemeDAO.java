package com.saarthi.dao;

import com.saarthi.model.Scheme;
import com.saarthi.util.DBUtil;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** All SQL for the `schemes` table lives here — nowhere else. */
public class SchemeDAO {

    private static final String SELECT_BASE =
            "SELECT s.*, c.category_name FROM schemes s " +
            "JOIN scheme_categories c ON s.category_id = c.category_id ";

    /** Used by the matching engine (Section 5.1) — only active schemes are candidates. */
    public List<Scheme> findAllActive() throws SQLException {
        String sql = SELECT_BASE + "WHERE s.is_active = TRUE";
        List<Scheme> schemes = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                schemes.add(mapRow(rs));
            }
        }
        return schemes;
    }

    /** FR9.1/FR9.2 — Admin scheme management needs to see inactive schemes too (to reactivate, audit, etc). */
    public List<Scheme> findAll() throws SQLException {
        String sql = SELECT_BASE + "ORDER BY s.name";
        List<Scheme> schemes = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                schemes.add(mapRow(rs));
            }
        }
        return schemes;
    }

    public Optional<Scheme> findById(int schemeId) throws SQLException {
        String sql = SELECT_BASE + "WHERE s.scheme_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, schemeId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        }
    }

    /** FR4.x — Scheme Explorer search/filter (category, state, keyword). */
    public List<Scheme> search(String categoryName, String state, String keyword) throws SQLException {
        StringBuilder sql = new StringBuilder(SELECT_BASE + "WHERE s.is_active = TRUE");
        List<Object> params = new ArrayList<>();

        if (categoryName != null) {
            sql.append(" AND c.category_name = ?");
            params.add(categoryName);
        }
        if (state != null) {
            sql.append(" AND (s.state = ? OR s.state IS NULL)");
            params.add(state);
        }
        if (keyword != null) {
            sql.append(" AND (s.name LIKE ? OR s.description LIKE ? OR s.benefit_summary LIKE ?)");
            String like = "%" + keyword + "%";
            params.add(like);
            params.add(like);
            params.add(like);
        }
        sql.append(" ORDER BY s.name");

        List<Scheme> schemes = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    schemes.add(mapRow(rs));
                }
            }
        }
        return schemes;
    }

    /** FR9.1 — create a new scheme record. */
    public int insert(Scheme s) throws SQLException {
        String sql = "INSERT INTO schemes " +
                "(name, description, ministry, category_id, state, benefit_summary, benefit_amount, " +
                "application_url, official_portal, is_active, deadline, source_url, verified_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            bindWritableFields(ps, s);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
            throw new SQLException("Insert into schemes did not return a generated key.");
        }
    }

    /**
     * FR9.1/FR9.3/FR9.4 — updates a scheme on one connection so the
     * sp_set_audit_actor session variable is visible to trg_schemes_audit_on_update
     * (that trigger auto-audits name/benefit_summary/is_active/deadline/verified_at;
     * AdminService separately audits the fields it doesn't cover).
     */
    public void updateForAdmin(int actorUserId, Scheme s) throws SQLException {
        String updateSql = "UPDATE schemes SET name=?, description=?, ministry=?, category_id=?, state=?, " +
                "benefit_summary=?, benefit_amount=?, application_url=?, official_portal=?, is_active=?, " +
                "deadline=?, source_url=?, verified_at=? WHERE scheme_id=?";
        try (Connection conn = DBUtil.getConnection()) {
            try (CallableStatement actor = conn.prepareCall("{call sp_set_audit_actor(?)}")) {
                actor.setInt(1, actorUserId);
                actor.execute();
            }
            try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                int nextIdx = bindWritableFields(ps, s);
                ps.setInt(nextIdx, s.getSchemeId());
                ps.executeUpdate();
            }
        }
    }

    private int bindWritableFields(PreparedStatement ps, Scheme s) throws SQLException {
        ps.setString(1, s.getName());
        ps.setString(2, s.getDescription());
        ps.setString(3, s.getMinistry());
        ps.setInt(4, s.getCategoryId());
        if (s.getState() != null && !s.getState().isEmpty()) ps.setString(5, s.getState()); else ps.setNull(5, Types.VARCHAR);
        ps.setString(6, s.getBenefitSummary());
        ps.setString(7, s.getBenefitAmount());
        ps.setString(8, s.getApplicationUrl());
        ps.setString(9, s.getOfficialPortal());
        ps.setBoolean(10, s.isActive());
        if (s.getDeadline() != null) ps.setDate(11, Date.valueOf(s.getDeadline())); else ps.setNull(11, Types.DATE);
        ps.setString(12, s.getSourceUrl());
        if (s.getVerifiedAt() != null) ps.setDate(13, Date.valueOf(s.getVerifiedAt())); else ps.setNull(13, Types.DATE);
        return 14;
    }

    private Scheme mapRow(ResultSet rs) throws SQLException {
        Scheme s = new Scheme();
        s.setSchemeId(rs.getInt("scheme_id"));
        s.setName(rs.getString("name"));
        s.setDescription(rs.getString("description"));
        s.setMinistry(rs.getString("ministry"));
        s.setCategoryId(rs.getInt("category_id"));
        s.setCategoryName(rs.getString("category_name"));
        s.setState(rs.getString("state"));
        s.setBenefitSummary(rs.getString("benefit_summary"));
        s.setBenefitAmount(rs.getString("benefit_amount"));
        s.setApplicationUrl(rs.getString("application_url"));
        s.setOfficialPortal(rs.getString("official_portal"));
        s.setActive(rs.getBoolean("is_active"));
        Date deadline = rs.getDate("deadline");
        if (deadline != null) s.setDeadline(deadline.toLocalDate());
        s.setSourceUrl(rs.getString("source_url"));
        Date verifiedAt = rs.getDate("verified_at");
        if (verifiedAt != null) s.setVerifiedAt(verifiedAt.toLocalDate());
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) s.setCreatedAt(createdAt.toLocalDateTime());
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) s.setUpdatedAt(updatedAt.toLocalDateTime());
        return s;
    }
}
