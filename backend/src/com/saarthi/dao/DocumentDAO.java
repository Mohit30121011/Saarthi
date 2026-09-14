package com.saarthi.dao;

import com.saarthi.model.RequiredDocument;
import com.saarthi.util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** All SQL for the `required_documents` table lives here — nowhere else. */
public class DocumentDAO {

    /** FR9.2 */
    public int insert(RequiredDocument d) throws SQLException {
        String sql = "INSERT INTO required_documents (scheme_id, document_name, document_category, is_mandatory) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, d.getSchemeId());
            ps.setString(2, d.getDocumentName());
            ps.setString(3, d.getDocumentCategory());
            ps.setBoolean(4, d.isMandatory());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getInt(1);
            }
            throw new SQLException("Insert into required_documents did not return a generated key.");
        }
    }

    /** FR9.2 */
    public void update(RequiredDocument d) throws SQLException {
        String sql = "UPDATE required_documents SET document_name=?, document_category=?, is_mandatory=? WHERE doc_id=?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, d.getDocumentName());
            ps.setString(2, d.getDocumentCategory());
            ps.setBoolean(3, d.isMandatory());
            ps.setInt(4, d.getDocId());
            ps.executeUpdate();
        }
    }

    /** FR9.2 */
    public void delete(int docId) throws SQLException {
        String sql = "DELETE FROM required_documents WHERE doc_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, docId);
            ps.executeUpdate();
        }
    }

    public Optional<RequiredDocument> findById(int docId) throws SQLException {
        String sql = "SELECT * FROM required_documents WHERE doc_id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, docId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        }
    }

    public List<RequiredDocument> findBySchemeId(int schemeId) throws SQLException {
        String sql = "SELECT * FROM required_documents WHERE scheme_id = ?";
        List<RequiredDocument> docs = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, schemeId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    docs.add(mapRow(rs));
                }
            }
        }
        return docs;
    }

    /** Section 5.4 — checklist de-duplication needs documents for a whole set of schemes at once. */
    public List<RequiredDocument> findBySchemeIds(List<Integer> schemeIds) throws SQLException {
        if (schemeIds.isEmpty()) return new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT * FROM required_documents WHERE scheme_id IN (");
        for (int i = 0; i < schemeIds.size(); i++) {
            sql.append(i == 0 ? "?" : ",?");
        }
        sql.append(")");

        List<RequiredDocument> docs = new ArrayList<>();
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < schemeIds.size(); i++) {
                ps.setInt(i + 1, schemeIds.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    docs.add(mapRow(rs));
                }
            }
        }
        return docs;
    }

    private RequiredDocument mapRow(ResultSet rs) throws SQLException {
        RequiredDocument d = new RequiredDocument();
        d.setDocId(rs.getInt("doc_id"));
        d.setSchemeId(rs.getInt("scheme_id"));
        d.setDocumentName(rs.getString("document_name"));
        d.setDocumentCategory(rs.getString("document_category"));
        d.setMandatory(rs.getBoolean("is_mandatory"));
        return d;
    }
}
