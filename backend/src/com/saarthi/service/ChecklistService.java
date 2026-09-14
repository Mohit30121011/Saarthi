package com.saarthi.service;

import com.saarthi.dao.ChecklistItemStateDAO;
import com.saarthi.dao.DocumentDAO;
import com.saarthi.model.RequiredDocument;
import com.saarthi.model.Scheme;
import com.saarthi.model.SchemeMatch;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * FR6.x — Document Checklist Generator, implementing the De-duplication
 * Algorithm (SRS Section 5.4). No SQL, DAOs only.
 */
public class ChecklistService {

    /** Common spelling/phrasing variants seen across scheme document lists, mapped to one canonical name. */
    private static final Map<String, String> CANONICAL_ALIASES = new LinkedHashMap<>();
    static {
        CANONICAL_ALIASES.put("aadhaar card", "Aadhaar Card");
        CANONICAL_ALIASES.put("aadhar card", "Aadhaar Card");
        CANONICAL_ALIASES.put("aadhaar", "Aadhaar Card");
        CANONICAL_ALIASES.put("aadhar", "Aadhaar Card");
        CANONICAL_ALIASES.put("pan card", "PAN Card");
        CANONICAL_ALIASES.put("pan", "PAN Card");
        CANONICAL_ALIASES.put("income certificate", "Income Certificate");
        CANONICAL_ALIASES.put("income proof", "Income Certificate");
        CANONICAL_ALIASES.put("caste certificate", "Caste Certificate");
        CANONICAL_ALIASES.put("category certificate", "Caste Certificate");
        CANONICAL_ALIASES.put("bank passbook", "Bank Passbook");
        CANONICAL_ALIASES.put("bank account passbook", "Bank Passbook");
        CANONICAL_ALIASES.put("bank statement", "Bank Passbook");
        CANONICAL_ALIASES.put("passport size photograph", "Passport Size Photograph");
        CANONICAL_ALIASES.put("passport photo", "Passport Size Photograph");
        CANONICAL_ALIASES.put("photograph", "Passport Size Photograph");
        CANONICAL_ALIASES.put("domicile certificate", "Domicile Certificate");
        CANONICAL_ALIASES.put("residence proof", "Domicile Certificate");
        CANONICAL_ALIASES.put("address proof", "Address Proof");
        CANONICAL_ALIASES.put("bpl card", "BPL Card");
        CANONICAL_ALIASES.put("ration card", "Ration Card");
        CANONICAL_ALIASES.put("disability certificate", "Disability Certificate");
        CANONICAL_ALIASES.put("voter id", "Voter ID Card");
        CANONICAL_ALIASES.put("voter id card", "Voter ID Card");
        CANONICAL_ALIASES.put("land ownership document", "Land Ownership Document");
        CANONICAL_ALIASES.put("7/12 extract", "Land Ownership Document");
    }

    private final EligibilityService eligibilityService = new EligibilityService();
    private final DocumentDAO documentDAO = new DocumentDAO();
    private final ChecklistItemStateDAO checklistStateDAO = new ChecklistItemStateDAO();

    public static final class ChecklistItem {
        public final String documentName; // canonical
        public final String documentCategory;
        public final boolean mandatory;
        public final boolean checked;
        public final List<SchemeRef> contributingSchemes;

        ChecklistItem(String documentName, String documentCategory, boolean mandatory, boolean checked, List<SchemeRef> contributingSchemes) {
            this.documentName = documentName;
            this.documentCategory = documentCategory;
            this.mandatory = mandatory;
            this.checked = checked;
            this.contributingSchemes = contributingSchemes;
        }
    }

    public static final class SchemeRef {
        public final int schemeId;
        public final String schemeName;

        SchemeRef(int schemeId, String schemeName) {
            this.schemeId = schemeId;
            this.schemeName = schemeName;
        }
    }

    /** FR6.1/FR6.2/FR6.4 — one consolidated, de-duplicated, grouped checklist for a user's STRONG matches. */
    public Map<String, List<ChecklistItem>> getChecklist(int userId) throws SQLException {
        List<SchemeMatch> strongMatches = eligibilityService.getPersonalizedMatches(userId).stream()
                .filter(m -> m.getConfidence() == SchemeMatch.Confidence.STRONG)
                .collect(Collectors.toList());

        Map<Integer, String> schemeNamesById = new LinkedHashMap<>();
        List<Integer> schemeIds = new ArrayList<>();
        for (SchemeMatch m : strongMatches) {
            Scheme s = m.getScheme();
            schemeIds.add(s.getSchemeId());
            schemeNamesById.put(s.getSchemeId(), s.getName());
        }

        List<RequiredDocument> documents = documentDAO.findBySchemeIds(schemeIds);
        Map<String, Boolean> checkedState = checklistStateDAO.findCheckedStateByUserId(userId);

        // key = documentCategory -> normalizedName -> merged item builder
        Map<String, Map<String, MergedItem>> byCategory = new LinkedHashMap<>();
        for (RequiredDocument doc : documents) {
            String category = doc.getDocumentCategory() == null ? "Other" : doc.getDocumentCategory();
            String canonicalName = canonicalize(doc.getDocumentName());
            String normalizedKey = canonicalName.toLowerCase();

            Map<String, MergedItem> items = byCategory.computeIfAbsent(category, k -> new LinkedHashMap<>());
            MergedItem item = items.computeIfAbsent(normalizedKey, k -> new MergedItem(canonicalName));
            item.mandatory = item.mandatory || doc.isMandatory();
            String schemeName = schemeNamesById.get(doc.getSchemeId());
            if (schemeName != null) {
                item.schemes.add(new SchemeRef(doc.getSchemeId(), schemeName));
            }
        }

        Map<String, List<ChecklistItem>> result = new LinkedHashMap<>();
        for (Map.Entry<String, Map<String, MergedItem>> categoryEntry : byCategory.entrySet()) {
            List<ChecklistItem> items = new ArrayList<>();
            for (MergedItem merged : categoryEntry.getValue().values()) {
                boolean checked = checkedState.getOrDefault(merged.canonicalName.toLowerCase(), false);
                items.add(new ChecklistItem(merged.canonicalName, categoryEntry.getKey(), merged.mandatory, checked, merged.schemes));
            }
            result.put(categoryEntry.getKey(), items);
        }
        return result;
    }

    /** FR6.3 — toggle persists across sessions, keyed by the same canonicalized name used to build the checklist. */
    public void setChecked(int userId, String documentName, boolean checked) throws SQLException {
        checklistStateDAO.setChecked(userId, canonicalize(documentName).toLowerCase(), checked);
    }

    private String canonicalize(String rawName) {
        String cleaned = rawName.trim().toLowerCase().replaceAll("[^a-z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        return CANONICAL_ALIASES.getOrDefault(cleaned, titleCase(rawName.trim()));
    }

    private String titleCase(String s) {
        StringBuilder sb = new StringBuilder();
        for (String word : s.split("\\s+")) {
            if (word.isEmpty()) continue;
            sb.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1)).append(' ');
        }
        return sb.toString().trim();
    }

    private static final class MergedItem {
        final String canonicalName;
        boolean mandatory;
        final List<SchemeRef> schemes = new ArrayList<>();

        MergedItem(String canonicalName) {
            this.canonicalName = canonicalName;
        }
    }
}
