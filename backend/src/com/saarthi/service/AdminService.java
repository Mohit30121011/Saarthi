package com.saarthi.service;

import com.saarthi.dao.AdminAuditDAO;
import com.saarthi.dao.DocumentDAO;
import com.saarthi.dao.EligibilityRuleDAO;
import com.saarthi.dao.SchemeDAO;
import com.saarthi.model.EligibilityRule;
import com.saarthi.model.RequiredDocument;
import com.saarthi.model.Scheme;

import java.sql.SQLException;
import java.util.Objects;
import java.util.Optional;

/**
 * FR9.1-FR9.4 — Admin scheme/rule/document management, with a full audit
 * trail (FR9.3). Role gating (FR9.5) is AuthFilter's job, not this class's.
 * No SQL, DAOs only.
 */
public class AdminService {

    /** Fields trg_schemes_audit_on_update already covers — do not double-audit these manually. */
    private static final java.util.Set<String> TRIGGER_COVERED_FIELDS = java.util.Set.of(
            "name", "benefit_summary", "is_active", "deadline", "verified_at"
    );

    private final SchemeDAO schemeDAO = new SchemeDAO();
    private final EligibilityRuleDAO ruleDAO = new EligibilityRuleDAO();
    private final DocumentDAO documentDAO = new DocumentDAO();
    private final AdminAuditDAO auditDAO = new AdminAuditDAO();

    /** FR9.1/FR9.2 — includes inactive schemes, unlike the public /api/schemes catalog. */
    public java.util.List<Scheme> listAllSchemes() throws SQLException {
        return schemeDAO.findAll();
    }

    /** FR9.1 */
    public Scheme createScheme(int actorUserId, Scheme scheme) throws SQLException {
        int schemeId = schemeDAO.insert(scheme);
        auditDAO.insert(schemeId, "created", null, scheme.getName(), actorUserId);
        return schemeDAO.findById(schemeId).orElseThrow(() -> new IllegalStateException("Scheme vanished immediately after insert"));
    }

    /** FR9.1/FR9.3/FR9.4 — full-record update; manually audits the fields the DB trigger doesn't track. */
    public Optional<Scheme> updateScheme(int actorUserId, int schemeId, Scheme updates) throws SQLException {
        Optional<Scheme> existing = schemeDAO.findById(schemeId);
        if (!existing.isPresent()) {
            return Optional.empty();
        }
        Scheme before = existing.get();
        updates.setSchemeId(schemeId);

        auditFieldChange(actorUserId, schemeId, "description", before.getDescription(), updates.getDescription());
        auditFieldChange(actorUserId, schemeId, "ministry", before.getMinistry(), updates.getMinistry());
        auditFieldChange(actorUserId, schemeId, "category_id", String.valueOf(before.getCategoryId()), String.valueOf(updates.getCategoryId()));
        auditFieldChange(actorUserId, schemeId, "state", before.getState(), updates.getState());
        auditFieldChange(actorUserId, schemeId, "benefit_amount", before.getBenefitAmount(), updates.getBenefitAmount());
        auditFieldChange(actorUserId, schemeId, "application_url", before.getApplicationUrl(), updates.getApplicationUrl());
        auditFieldChange(actorUserId, schemeId, "official_portal", before.getOfficialPortal(), updates.getOfficialPortal());
        auditFieldChange(actorUserId, schemeId, "source_url", before.getSourceUrl(), updates.getSourceUrl());

        schemeDAO.updateForAdmin(actorUserId, updates); // trigger auto-audits name/benefit_summary/is_active/deadline/verified_at
        return schemeDAO.findById(schemeId);
    }

    /** FR9.1 — soft-delete via is_active = false. */
    public Optional<Scheme> deactivateScheme(int actorUserId, int schemeId) throws SQLException {
        Optional<Scheme> existing = schemeDAO.findById(schemeId);
        if (!existing.isPresent()) {
            return Optional.empty();
        }
        Scheme scheme = existing.get();
        scheme.setActive(false);
        schemeDAO.updateForAdmin(actorUserId, scheme); // trigger auto-audits is_active
        return schemeDAO.findById(schemeId);
    }

    /** FR9.2/FR9.3 */
    public EligibilityRule addRule(int actorUserId, int schemeId, EligibilityRule rule) throws SQLException {
        rule.setSchemeId(schemeId);
        int ruleId = ruleDAO.insert(rule);
        auditDAO.insert(schemeId, "eligibility_rule_added", null, describeRule(rule), actorUserId);
        return ruleDAO.findById(ruleId).orElseThrow(() -> new IllegalStateException("Rule vanished immediately after insert"));
    }

    /** FR9.2/FR9.3 */
    public Optional<EligibilityRule> updateRule(int actorUserId, int ruleId, EligibilityRule updates) throws SQLException {
        Optional<EligibilityRule> existing = ruleDAO.findById(ruleId);
        if (!existing.isPresent()) {
            return Optional.empty();
        }
        EligibilityRule before = existing.get();
        updates.setRuleId(ruleId);
        updates.setSchemeId(before.getSchemeId());
        ruleDAO.update(updates);
        auditDAO.insert(before.getSchemeId(), "eligibility_rule_updated", describeRule(before), describeRule(updates), actorUserId);
        return ruleDAO.findById(ruleId);
    }

    /** FR9.2/FR9.3 */
    public boolean deleteRule(int actorUserId, int ruleId) throws SQLException {
        Optional<EligibilityRule> existing = ruleDAO.findById(ruleId);
        if (!existing.isPresent()) {
            return false;
        }
        EligibilityRule rule = existing.get();
        ruleDAO.delete(ruleId);
        auditDAO.insert(rule.getSchemeId(), "eligibility_rule_removed", describeRule(rule), null, actorUserId);
        return true;
    }

    /** FR9.2/FR9.3 */
    public RequiredDocument addDocument(int actorUserId, int schemeId, RequiredDocument document) throws SQLException {
        document.setSchemeId(schemeId);
        int docId = documentDAO.insert(document);
        auditDAO.insert(schemeId, "required_document_added", null, describeDocument(document), actorUserId);
        return documentDAO.findById(docId).orElseThrow(() -> new IllegalStateException("Document vanished immediately after insert"));
    }

    /** FR9.2/FR9.3 */
    public Optional<RequiredDocument> updateDocument(int actorUserId, int docId, RequiredDocument updates) throws SQLException {
        Optional<RequiredDocument> existing = documentDAO.findById(docId);
        if (!existing.isPresent()) {
            return Optional.empty();
        }
        RequiredDocument before = existing.get();
        updates.setDocId(docId);
        updates.setSchemeId(before.getSchemeId());
        documentDAO.update(updates);
        auditDAO.insert(before.getSchemeId(), "required_document_updated", describeDocument(before), describeDocument(updates), actorUserId);
        return documentDAO.findById(docId);
    }

    /** FR9.2/FR9.3 */
    public boolean deleteDocument(int actorUserId, int docId) throws SQLException {
        Optional<RequiredDocument> existing = documentDAO.findById(docId);
        if (!existing.isPresent()) {
            return false;
        }
        RequiredDocument document = existing.get();
        documentDAO.delete(docId);
        auditDAO.insert(document.getSchemeId(), "required_document_removed", describeDocument(document), null, actorUserId);
        return true;
    }

    private void auditFieldChange(int actorUserId, int schemeId, String field, String oldValue, String newValue) throws SQLException {
        if (TRIGGER_COVERED_FIELDS.contains(field)) return; // defensive — should never be called with these
        if (Objects.equals(oldValue, newValue)) return;
        auditDAO.insert(schemeId, field, oldValue, newValue, actorUserId);
    }

    private String describeRule(EligibilityRule r) {
        return r.getAttributeName() + " " + r.getOperator() + " " + r.getValue();
    }

    private String describeDocument(RequiredDocument d) {
        return d.getDocumentName() + " (" + d.getDocumentCategory() + (d.isMandatory() ? ", mandatory" : ", optional") + ")";
    }
}
