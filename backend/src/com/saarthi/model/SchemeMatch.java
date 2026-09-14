package com.saarthi.model;

import java.util.List;

/** Output of EligibilityService per SRS Section 5.2/5.3 — one per STRONG/PARTIAL scheme. */
public class SchemeMatch {
    public enum Confidence { STRONG, PARTIAL }

    private final Scheme scheme;
    private final Confidence confidence;
    private final List<String> missingFields;

    public SchemeMatch(Scheme scheme, Confidence confidence, List<String> missingFields) {
        this.scheme = scheme;
        this.confidence = confidence;
        this.missingFields = missingFields;
    }

    public Scheme getScheme() { return scheme; }
    public Confidence getConfidence() { return confidence; }
    public List<String> getMissingFields() { return missingFields; }
}
