package com.saarthi.service;

import com.saarthi.dao.DocumentDAO;
import com.saarthi.dao.EligibilityRuleDAO;
import com.saarthi.dao.SchemeDAO;
import com.saarthi.model.EligibilityRule;
import com.saarthi.model.RequiredDocument;
import com.saarthi.model.Scheme;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/** FR4.x (Explorer search) / FR5.x (Scheme Detail) — no SQL, DAOs only. */
public class SchemeService {

    private final SchemeDAO schemeDAO = new SchemeDAO();
    private final EligibilityRuleDAO ruleDAO = new EligibilityRuleDAO();
    private final DocumentDAO documentDAO = new DocumentDAO();

    public static final class SchemeDetail {
        public final Scheme scheme;
        public final List<EligibilityRule> rules;
        public final List<RequiredDocument> documents;

        public SchemeDetail(Scheme scheme, List<EligibilityRule> rules, List<RequiredDocument> documents) {
            this.scheme = scheme;
            this.rules = rules;
            this.documents = documents;
        }
    }

    /** FR4.1-FR4.x — Explorer: browse/search all active schemes, optionally filtered. */
    public List<Scheme> search(String category, String state, String keyword) throws SQLException {
        return schemeDAO.search(category, state, keyword);
    }

    /** FR5.1 — Scheme Detail: full scheme info + the rules and documents behind it. */
    public Optional<SchemeDetail> getDetail(int schemeId) throws SQLException {
        Optional<Scheme> scheme = schemeDAO.findById(schemeId);
        if (!scheme.isPresent()) {
            return Optional.empty();
        }
        List<EligibilityRule> rules = ruleDAO.findBySchemeId(schemeId);
        List<RequiredDocument> documents = documentDAO.findBySchemeId(schemeId);
        return Optional.of(new SchemeDetail(scheme.get(), rules, documents));
    }
}
