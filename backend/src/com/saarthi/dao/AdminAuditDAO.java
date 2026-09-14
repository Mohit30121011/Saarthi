package com.saarthi.dao;

import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * Manual `admin_scheme_audit` writes for changes the DB trigger
 * (trg_schemes_audit_on_update) doesn't cover — eligibility_rules,
 * required_documents, and the scheme fields outside its tracked set
 * (ministry, description, benefit_amount, application_url, official_portal,
 * category_id, state). FR9.3.
 */
public class AdminAuditDAO {

    public void insert(int schemeId, String changedField, String oldValue, String newValue, int changedByUserId) throws SQLException {
        String sql = "INSERT INTO admin_scheme_audit (scheme_id, changed_field, old_value, new_value, changed_by) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, schemeId);
            ps.setString(2, changedField);
            ps.setString(3, oldValue);
            ps.setString(4, newValue);
            ps.setInt(5, changedByUserId);
            ps.executeUpdate();
        }
    }
}
