package com.saarthi.dao;

import com.saarthi.model.EligibilityRule;
import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** All SQL for the `eligibility_rules` table lives here — nowhere else. */
public class EligibilityRuleDAO {

    /** FR9.2 */
    public int insert(EligibilityRule r) throws SQLException {
        String sql = "INSERT INTO eligibility_rules (scheme_id, attribute_name, operator, value, rule_description, source_text_snippet) " +
                "VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, r.getSchemeId());
            ps.setString(2, r.getAttributeName());
            ps.setString(3, r.getOperator());
            ps.setString(4, r.getValue());
            ps.setString(5, r.getRuleDescription());
            ps.setString(6, r.getSourceTextSnippet());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
            throw new SQLException("Insert into eligibility_rules did not return a generated key.");
        }
    }

    /** FR9.2 */
    public void update(EligibilityRule r) throws SQLException {
        String sql = "UPDATE eligibility_rules SET attribute_name=?, operator=?, value=?, rule_description=?, source_text_snippet=? WHERE rule_id=?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, r.getAttributeName());
            ps.setString(2, r.getOperator());
            ps.setString(3, r.getValue());
            ps.setString(4, r.getRuleDescription());
            ps.setString(5, r.getSourceTextSnippet());
            ps.setInt(6, r.getRuleId());
            ps.executeUpdate();
        }
    }

    /** FR9.2 */
    public void delete(int ruleId) throws SQLException {
        String sql = "DELETE FROM eligibility_rules WHERE rule_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, ruleId);
            ps.executeUpdate();
        }
    }

    public Optional<EligibilityRule> findById(int ruleId) throws SQLException {
        String sql = "SELECT * FROM eligibility_rules WHERE rule_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, ruleId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        }
    }

    public List<EligibilityRule> findBySchemeId(int schemeId) throws SQLException {
        String sql = "SELECT * FROM eligibility_rules WHERE scheme_id = ?";
        List<EligibilityRule> rules = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, schemeId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    rules.add(mapRow(rs));
                }
            }
        }
        return rules;
    }

    /** Bulk-load — one query for all active schemes instead of N+1 per-scheme queries. */
    public java.util.Map<Integer, List<EligibilityRule>> findAllGroupedBySchemeId() throws SQLException {
        String sql = "SELECT * FROM eligibility_rules";
        java.util.Map<Integer, List<EligibilityRule>> bySchemeId = new java.util.HashMap<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                EligibilityRule rule = mapRow(rs);
                bySchemeId.computeIfAbsent(rule.getSchemeId(), k -> new ArrayList<>()).add(rule);
            }
        }
        return bySchemeId;
    }

    private EligibilityRule mapRow(ResultSet rs) throws SQLException {
        EligibilityRule r = new EligibilityRule();
        r.setRuleId(rs.getInt("rule_id"));
        r.setSchemeId(rs.getInt("scheme_id"));
        r.setAttributeName(rs.getString("attribute_name"));
        r.setOperator(rs.getString("operator"));
        r.setValue(rs.getString("value"));
        r.setRuleDescription(rs.getString("rule_description"));
        r.setSourceTextSnippet(rs.getString("source_text_snippet"));
        return r;
    }
}
