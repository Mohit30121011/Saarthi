package com.saarthi.dao;

import com.saarthi.model.UserProfile;
import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.Optional;

/** All SQL for the `user_profiles` table lives here — nowhere else. */
public class ProfileDAO {

    public Optional<UserProfile> findByUserId(int userId) throws SQLException {
        String sql = "SELECT * FROM user_profiles WHERE user_id = ?";
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

    /** Upsert — profile row is created on first save, updated thereafter (FR2.1/FR2.3). */
    public void upsert(UserProfile p) throws SQLException {
        String sql = "INSERT INTO user_profiles " +
                "(user_id, date_of_birth, gender, state, district, annual_income, occupation, category, education_level, disability_status, is_bpl, is_minority) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "date_of_birth = VALUES(date_of_birth), gender = VALUES(gender), state = VALUES(state), " +
                "district = VALUES(district), annual_income = VALUES(annual_income), occupation = VALUES(occupation), " +
                "category = VALUES(category), education_level = VALUES(education_level), " +
                "disability_status = VALUES(disability_status), is_bpl = VALUES(is_bpl), is_minority = VALUES(is_minority)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, p.getUserId());
            setNullableDate(ps, 2, p.getDateOfBirth());
            setNullableString(ps, 3, p.getGender());
            setNullableString(ps, 4, p.getState());
            setNullableString(ps, 5, p.getDistrict());
            if (p.getAnnualIncome() != null) ps.setBigDecimal(6, p.getAnnualIncome()); else ps.setNull(6, Types.DECIMAL);
            setNullableString(ps, 7, p.getOccupation());
            setNullableString(ps, 8, p.getCategory());
            setNullableString(ps, 9, p.getEducationLevel());
            setNullableBoolean(ps, 10, p.getDisabilityStatus());
            setNullableBoolean(ps, 11, p.getIsBpl());
            setNullableBoolean(ps, 12, p.getIsMinority());
            ps.executeUpdate();
        }
    }

    public void touchMatchSnapshot(int userId) throws SQLException {
        String sql = "UPDATE user_profiles SET last_match_snapshot_at = CURRENT_TIMESTAMP WHERE user_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.executeUpdate();
        }
    }

    private void setNullableDate(PreparedStatement ps, int idx, java.time.LocalDate d) throws SQLException {
        if (d != null) ps.setDate(idx, Date.valueOf(d)); else ps.setNull(idx, Types.DATE);
    }

    private void setNullableString(PreparedStatement ps, int idx, String s) throws SQLException {
        if (s != null) ps.setString(idx, s); else ps.setNull(idx, Types.VARCHAR);
    }

    private void setNullableBoolean(PreparedStatement ps, int idx, Boolean b) throws SQLException {
        if (b != null) ps.setBoolean(idx, b); else ps.setNull(idx, Types.BOOLEAN);
    }

    private UserProfile mapRow(ResultSet rs) throws SQLException {
        UserProfile p = new UserProfile();
        p.setProfileId(rs.getInt("profile_id"));
        p.setUserId(rs.getInt("user_id"));
        Date dob = rs.getDate("date_of_birth");
        if (dob != null) p.setDateOfBirth(dob.toLocalDate());
        p.setGender(rs.getString("gender"));
        p.setState(rs.getString("state"));
        p.setDistrict(rs.getString("district"));
        p.setAnnualIncome(rs.getBigDecimal("annual_income"));
        p.setOccupation(rs.getString("occupation"));
        p.setCategory(rs.getString("category"));
        p.setEducationLevel(rs.getString("education_level"));
        boolean disability = rs.getBoolean("disability_status");
        p.setDisabilityStatus(rs.wasNull() ? null : disability);
        boolean bpl = rs.getBoolean("is_bpl");
        p.setIsBpl(rs.wasNull() ? null : bpl);
        boolean minority = rs.getBoolean("is_minority");
        p.setIsMinority(rs.wasNull() ? null : minority);
        Timestamp snapshotAt = rs.getTimestamp("last_match_snapshot_at");
        if (snapshotAt != null) p.setLastMatchSnapshotAt(snapshotAt.toLocalDateTime());
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) p.setUpdatedAt(updatedAt.toLocalDateTime());
        return p;
    }
}
