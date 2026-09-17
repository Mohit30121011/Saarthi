package com.saarthi.dao;

import com.saarthi.model.SchemeReport;
import com.saarthi.util.DBUtil;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SchemeReportDAO {

    static {
        ensureTable();
    }

    private static void ensureTable() {
        String createTableSql = "CREATE TABLE IF NOT EXISTS scheme_reports (" +
                "report_id INT PRIMARY KEY AUTO_INCREMENT, " +
                "scheme_id INT NOT NULL, " +
                "user_id INT NULL, " +
                "reason VARCHAR(50) NOT NULL, " +
                "reason_label VARCHAR(100) NOT NULL, " +
                "details TEXT NULL, " +
                "status ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING', " +
                "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                "reviewed_at TIMESTAMP NULL DEFAULT NULL, " +
                "reviewed_by INT NULL, " +
                "admin_notes TEXT NULL, " +
                "CONSTRAINT fk_report_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE, " +
                "CONSTRAINT fk_report_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL, " +
                "CONSTRAINT fk_report_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL, " +
                "INDEX idx_reports_status (status), " +
                "INDEX idx_reports_scheme (scheme_id)" +
                ") ENGINE=InnoDB;";

        try (Connection conn = DBUtil.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(createTableSql);
        } catch (SQLException e) {
            System.err.println("SchemeReportDAO: Failed to ensure scheme_reports table: " + e.getMessage());
        }
    }

    public SchemeReport createReport(SchemeReport report) throws SQLException {
        String sql = "INSERT INTO scheme_reports (scheme_id, user_id, reason, reason_label, details, status) " +
                "VALUES (?, ?, ?, ?, ?, 'PENDING')";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, report.getSchemeId());
            if (report.getUserId() != null && report.getUserId() > 0) {
                ps.setInt(2, report.getUserId());
            } else {
                ps.setNull(2, Types.INTEGER);
            }
            ps.setString(3, report.getReason());
            ps.setString(4, report.getReasonLabel());
            ps.setString(5, report.getDetails());

            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    report.setReportId(rs.getInt(1));
                }
            }
        }
        return report;
    }

    public List<SchemeReport> listReports(String statusFilter) throws SQLException {
        StringBuilder sql = new StringBuilder(
                "SELECT r.report_id, r.scheme_id, s.name AS scheme_name, " +
                "       r.user_id, u.full_name AS user_name, u.email AS user_email, " +
                "       r.reason, r.reason_label, r.details, r.status, r.created_at, " +
                "       r.reviewed_at, r.reviewed_by, admin.full_name AS reviewer_name, r.admin_notes " +
                "FROM scheme_reports r " +
                "JOIN schemes s ON r.scheme_id = s.scheme_id " +
                "LEFT JOIN users u ON r.user_id = u.user_id " +
                "LEFT JOIN users admin ON r.reviewed_by = admin.user_id "
        );

        if (statusFilter != null && !statusFilter.trim().isEmpty() && !statusFilter.equalsIgnoreCase("ALL")) {
            sql.append("WHERE r.status = ? ");
        }
        sql.append("ORDER BY r.created_at DESC");

        List<SchemeReport> list = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            if (statusFilter != null && !statusFilter.trim().isEmpty() && !statusFilter.equalsIgnoreCase("ALL")) {
                ps.setString(1, statusFilter.toUpperCase());
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    SchemeReport report = new SchemeReport();
                    report.setReportId(rs.getInt("report_id"));
                    report.setSchemeId(rs.getInt("scheme_id"));
                    report.setSchemeName(rs.getString("scheme_name"));
                    int uid = rs.getInt("user_id");
                    report.setUserId(rs.wasNull() ? null : uid);
                    report.setUserName(rs.getString("user_name"));
                    report.setUserEmail(rs.getString("user_email"));
                    report.setReason(rs.getString("reason"));
                    report.setReasonLabel(rs.getString("reason_label"));
                    report.setDetails(rs.getString("details"));
                    report.setStatus(rs.getString("status"));

                    Timestamp cat = rs.getTimestamp("created_at");
                    if (cat != null) report.setCreatedAt(cat.toLocalDateTime());

                    Timestamp rat = rs.getTimestamp("reviewed_at");
                    if (rat != null) report.setReviewedAt(rat.toLocalDateTime());

                    int revBy = rs.getInt("reviewed_by");
                    report.setReviewedBy(rs.wasNull() ? null : revBy);
                    report.setReviewerName(rs.getString("reviewer_name"));
                    report.setAdminNotes(rs.getString("admin_notes"));

                    list.add(report);
                }
            }
        }
        return list;
    }

    public boolean updateStatus(int reportId, int adminUserId, String status, String adminNotes) throws SQLException {
        String sql = "UPDATE scheme_reports SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, " +
                "admin_notes = ? WHERE report_id = ?";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.toUpperCase());
            ps.setInt(2, adminUserId);
            ps.setString(3, adminNotes);
            ps.setInt(4, reportId);

            return ps.executeUpdate() > 0;
        }
    }
}
