package com.saarthi.service;

import com.saarthi.dao.EligibilityRuleDAO;
import com.saarthi.dao.ProfileDAO;
import com.saarthi.dao.SchemeDAO;
import com.saarthi.model.EligibilityRule;
import com.saarthi.model.Scheme;
import com.saarthi.model.SchemeMatch;
import com.saarthi.model.UserProfile;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The eligibility matching engine — SRS Section 5.1 (rule evaluation),
 * 5.2 (confidence scoring), 5.3 (ranking). All business logic lives here,
 * no SQL (DAOs only).
 */
public class EligibilityService {

    /** attribute_name (as stored in eligibility_rules) -> user-facing profile field name (camelCase, matches ProfileController's JSON contract). Used both to read the right profile value and to report missing fields (FR3.9). */
    private static final Map<String, String> ATTRIBUTE_TO_PROFILE_FIELD = Map.of(
            "age", "dateOfBirth",
            "annual_income", "annualIncome",
            "gender", "gender",
            "category", "category",
            "state", "state",
            "occupation", "occupation",
            "education_level", "educationLevel",
            "disability_status", "disabilityStatus",
            "is_bpl", "isBpl",
            "is_minority", "isMinority"
    );

    private final ProfileDAO profileDAO = new ProfileDAO();
    private final SchemeDAO schemeDAO = new SchemeDAO();
    private final EligibilityRuleDAO ruleDAO = new EligibilityRuleDAO();

    private enum RuleOutcome { PASS, FAIL, UNVERIFIABLE }

    /** Unlike SchemeMatch.Confidence (STRONG/PARTIAL only — NOT_MATCHED schemes are simply excluded from the dashboard), this includes NOT_MATCHED: ChatService (FR8.5) needs to tell a citizen "no" as plainly as "yes"/"partial". */
    public enum Verdict { STRONG, PARTIAL, NOT_MATCHED }

    /** One scheme's deterministic evaluation, tri-state. Reused verbatim by ChatService so the chatbot never re-implements eligibility logic (FR8.6/FR8.12). */
    public static final class EligibilityResult {
        private final Scheme scheme;
        private final Verdict verdict;
        private final List<String> missingFields;

        public EligibilityResult(Scheme scheme, Verdict verdict, List<String> missingFields) {
            this.scheme = scheme;
            this.verdict = verdict;
            this.missingFields = missingFields;
        }

        public Scheme getScheme() { return scheme; }
        public Verdict getVerdict() { return verdict; }
        public List<String> getMissingFields() { return missingFields; }
    }

    /** FR3.1-FR3.6/FR3.4 — used both for the initial dashboard load and the "refresh matches" action. */
    public List<SchemeMatch> getPersonalizedMatches(int userId) throws SQLException {
        UserProfile profile = profileDAO.findByUserId(userId).orElseGet(UserProfile::new);
        List<Scheme> activeSchemes = schemeDAO.findAllActive();
        Map<Integer, List<EligibilityRule>> rulesBySchemeId = ruleDAO.findAllGroupedBySchemeId();

        List<SchemeMatch> matches = new ArrayList<>();
        for (Scheme scheme : activeSchemes) {
            List<EligibilityRule> rules = rulesBySchemeId.getOrDefault(scheme.getSchemeId(), List.of());
            SchemeMatch match = evaluateScheme(scheme, profile, rules);
            if (match != null) { // NOT_MATCHED schemes are excluded entirely (FR3.6/Section 5.2)
                matches.add(match);
            }
        }
        return rank(matches);
    }

    public SimulationResult simulateProfile(int userId, BigDecimal simulatedIncome) throws SQLException {
        UserProfile baseProfile = userId > 0
                ? profileDAO.findByUserId(userId).orElseGet(UserProfile::new)
                : new UserProfile();
        List<Scheme> activeSchemes = schemeDAO.findAllActive();
        Map<Integer, List<EligibilityRule>> rulesBySchemeId = ruleDAO.findAllGroupedBySchemeId();

        // Baseline matches
        List<SchemeMatch> baselineMatches = new ArrayList<>();
        Set<Integer> baselineMatchedIds = new java.util.HashSet<>();
        for (Scheme scheme : activeSchemes) {
            List<EligibilityRule> rules = rulesBySchemeId.getOrDefault(scheme.getSchemeId(), List.of());
            SchemeMatch match = evaluateScheme(scheme, baseProfile, rules);
            if (match != null) {
                baselineMatches.add(match);
                baselineMatchedIds.add(scheme.getSchemeId());
            }
        }

        // Clone profile in-memory for simulation
        UserProfile simProfile = cloneProfile(baseProfile);
        if (simulatedIncome != null) {
            simProfile.setAnnualIncome(simulatedIncome);
        }

        // Simulated matches
        List<SchemeMatch> simMatches = new ArrayList<>();
        List<SimulatedOpportunity> newlyUnlocked = new ArrayList<>();
        List<SchemeMatch> retained = new ArrayList<>();
        List<SchemeMatch> lost = new ArrayList<>();

        for (Scheme scheme : activeSchemes) {
            List<EligibilityRule> rules = rulesBySchemeId.getOrDefault(scheme.getSchemeId(), List.of());
            SchemeMatch simMatch = evaluateScheme(scheme, simProfile, rules);
            boolean wasMatchedInBase = baselineMatchedIds.contains(scheme.getSchemeId());

            if (simMatch != null) {
                simMatches.add(simMatch);
                if (!wasMatchedInBase) {
                    String ceilingStr = null;
                    BigDecimal ceilingVal = null;
                    for (EligibilityRule r : rules) {
                        if ("annual_income".equalsIgnoreCase(r.getAttributeName()) && "<=".equals(r.getOperator())) {
                            ceilingStr = r.getValue();
                            try { ceilingVal = new BigDecimal(r.getValue().trim()); } catch (Exception ignored) {}
                            break;
                        }
                    }
                    newlyUnlocked.add(new SimulatedOpportunity(simMatch, ceilingStr, ceilingVal));
                } else {
                    retained.add(simMatch);
                }
            } else if (wasMatchedInBase) {
                lost.add(new SchemeMatch(scheme, SchemeMatch.Confidence.PARTIAL, List.of()));
            }
        }

        return new SimulationResult(
                baseProfile.getAnnualIncome(),
                simulatedIncome,
                baselineMatches.size(),
                simMatches.size(),
                rank(simMatches),
                newlyUnlocked,
                retained,
                lost
        );
    }

    private UserProfile cloneProfile(UserProfile src) {
        UserProfile copy = new UserProfile();
        copy.setProfileId(src.getProfileId());
        copy.setUserId(src.getUserId());
        copy.setDateOfBirth(src.getDateOfBirth());
        copy.setGender(src.getGender());
        copy.setState(src.getState());
        copy.setDistrict(src.getDistrict());
        copy.setAnnualIncome(src.getAnnualIncome());
        copy.setOccupation(src.getOccupation());
        copy.setCategory(src.getCategory());
        copy.setEducationLevel(src.getEducationLevel());
        copy.setDisabilityStatus(src.getDisabilityStatus());
        copy.setIsBpl(src.getIsBpl());
        copy.setIsMinority(src.getIsMinority());
        return copy;
    }

    public static class SimulatedOpportunity {
        private final SchemeMatch match;
        private final String ceilingRule;
        private final BigDecimal ceilingValue;

        public SimulatedOpportunity(SchemeMatch match, String ceilingRule, BigDecimal ceilingValue) {
            this.match = match;
            this.ceilingRule = ceilingRule;
            this.ceilingValue = ceilingValue;
        }

        public SchemeMatch getMatch() { return match; }
        public String getCeilingRule() { return ceilingRule; }
        public BigDecimal getCeilingValue() { return ceilingValue; }
    }

    public static class SimulationResult {
        private final BigDecimal baselineIncome;
        private final BigDecimal simulatedIncome;
        private final int baselineCount;
        private final int simulatedCount;
        private final List<SchemeMatch> simulatedMatches;
        private final List<SimulatedOpportunity> newlyUnlocked;
        private final List<SchemeMatch> retained;
        private final List<SchemeMatch> lost;

        public SimulationResult(BigDecimal baselineIncome, BigDecimal simulatedIncome, int baselineCount,
                                int simulatedCount, List<SchemeMatch> simulatedMatches,
                                List<SimulatedOpportunity> newlyUnlocked, List<SchemeMatch> retained,
                                List<SchemeMatch> lost) {
            this.baselineIncome = baselineIncome;
            this.simulatedIncome = simulatedIncome;
            this.baselineCount = baselineCount;
            this.simulatedCount = simulatedCount;
            this.simulatedMatches = simulatedMatches;
            this.newlyUnlocked = newlyUnlocked;
            this.retained = retained;
            this.lost = lost;
        }

        public BigDecimal getBaselineIncome() { return baselineIncome; }
        public BigDecimal getSimulatedIncome() { return simulatedIncome; }
        public int getBaselineCount() { return baselineCount; }
        public int getSimulatedCount() { return simulatedCount; }
        public List<SchemeMatch> getSimulatedMatches() { return simulatedMatches; }
        public List<SimulatedOpportunity> getNewlyUnlocked() { return newlyUnlocked; }
        public List<SchemeMatch> getRetained() { return retained; }
        public List<SchemeMatch> getLost() { return lost; }
    }

    /** Section 5.1/5.2 — evaluates one scheme's rules against one profile. Returns null for NOT_MATCHED (dashboard excludes it entirely). Delegates to the tri-state evaluate() below so there is exactly one place this logic lives. */
    private SchemeMatch evaluateScheme(Scheme scheme, UserProfile profile, List<EligibilityRule> rules) {
        EligibilityResult result = evaluate(scheme, profile, rules);
        if (result.getVerdict() == Verdict.NOT_MATCHED) {
            return null;
        }
        SchemeMatch.Confidence confidence = result.getVerdict() == Verdict.STRONG
                ? SchemeMatch.Confidence.STRONG
                : SchemeMatch.Confidence.PARTIAL;
        return new SchemeMatch(scheme, confidence, result.getMissingFields());
    }

    /**
     * Section 5.1/5.2, tri-state — the single implementation of "does this profile match this
     * scheme," reused by both the Dashboard path (evaluateScheme, above) and ChatService
     * (FR8.5/FR8.6), so eligibility logic is never duplicated per FR8.12.
     */
    public EligibilityResult evaluate(Scheme scheme, UserProfile profile, List<EligibilityRule> rules) {
        boolean anyFailed = false;
        Set<String> missingFields = new LinkedHashSet<>();

        for (EligibilityRule rule : rules) {
            RuleOutcome outcome = evaluateRule(profile, rule);
            if (outcome == RuleOutcome.FAIL) {
                anyFailed = true;
            } else if (outcome == RuleOutcome.UNVERIFIABLE) {
                missingFields.add(ATTRIBUTE_TO_PROFILE_FIELD.getOrDefault(rule.getAttributeName(), rule.getAttributeName()));
            }
        }

        if (anyFailed) {
            return new EligibilityResult(scheme, Verdict.NOT_MATCHED, List.of());
        }
        if (!missingFields.isEmpty()) {
            return new EligibilityResult(scheme, Verdict.PARTIAL, new ArrayList<>(missingFields));
        }
        return new EligibilityResult(scheme, Verdict.STRONG, List.of());
    }

    /** Convenience wrapper for ChatService — evaluates a small candidate set (not the full catalog) against one profile, fetching each scheme's rules via the existing DAO (Section 5.6 Step 2). */
    public List<EligibilityResult> evaluateCandidates(UserProfile profile, List<Scheme> candidates) throws SQLException {
        List<EligibilityResult> results = new ArrayList<>();
        for (Scheme scheme : candidates) {
            List<EligibilityRule> rules = ruleDAO.findBySchemeId(scheme.getSchemeId());
            results.add(evaluate(scheme, profile, rules));
        }
        return results;
    }

    /** Section 5.1 — a single rule row against the profile. NULL profile attribute = UNVERIFIABLE, never FAIL. */
    private RuleOutcome evaluateRule(UserProfile profile, EligibilityRule rule) {
        String attribute = rule.getAttributeName();
        String operator = rule.getOperator();
        String ruleValue = rule.getValue();

        switch (attribute) {
            case "age": {
                Integer age = profile.getAge();
                if (age == null) return RuleOutcome.UNVERIFIABLE;
                return compareNumeric(BigDecimal.valueOf(age), operator, new BigDecimal(ruleValue.trim()));
            }
            case "annual_income": {
                BigDecimal income = profile.getAnnualIncome();
                if (income == null) return RuleOutcome.UNVERIFIABLE;
                return compareNumeric(income, operator, new BigDecimal(ruleValue.trim()));
            }
            case "disability_status": return compareBoolean(profile.getDisabilityStatus(), operator, ruleValue);
            case "is_bpl": return compareBoolean(profile.getIsBpl(), operator, ruleValue);
            case "is_minority": return compareBoolean(profile.getIsMinority(), operator, ruleValue);
            case "gender": return compareGender(profile.getGender(), operator, ruleValue);
            case "category": return compareCategory(profile.getCategory(), operator, ruleValue);
            case "state": return compareState(profile.getState(), operator, ruleValue);
            case "occupation": return compareOccupation(profile.getOccupation(), operator, ruleValue);
            case "education_level": return compareEducation(profile.getEducationLevel(), operator, ruleValue);
            default: return RuleOutcome.UNVERIFIABLE; // unknown attribute — never silently fail a scheme over it
        }
    }

    private RuleOutcome compareNumeric(BigDecimal actual, String operator, BigDecimal ruleValue) {
        int cmp = actual.compareTo(ruleValue);
        boolean pass;
        switch (operator) {
            case "=": pass = cmp == 0; break;
            case "!=": pass = cmp != 0; break;
            case ">=": pass = cmp >= 0; break;
            case "<=": pass = cmp <= 0; break;
            case ">": pass = cmp > 0; break;
            case "<": pass = cmp < 0; break;
            default: return RuleOutcome.UNVERIFIABLE;
        }
        return pass ? RuleOutcome.PASS : RuleOutcome.FAIL;
    }

    private RuleOutcome compareBoolean(Boolean actual, String operator, String ruleValue) {
        if (actual == null) return RuleOutcome.UNVERIFIABLE;
        boolean expected = Boolean.parseBoolean(ruleValue.trim());
        boolean pass = "!=".equals(operator) ? actual != expected : actual == expected;
        return pass ? RuleOutcome.PASS : RuleOutcome.FAIL;
    }

    private RuleOutcome compareGender(String actual, String operator, String ruleValue) {
        if (actual == null || actual.trim().isEmpty()) return RuleOutcome.UNVERIFIABLE;
        String a = actual.toUpperCase().trim();
        String r = ruleValue.toUpperCase().trim();
        boolean pass = "!=".equals(operator) ? !a.equals(r) : (a.equals(r) || a.startsWith(r) || r.startsWith(a));
        return pass ? RuleOutcome.PASS : RuleOutcome.FAIL;
    }

    private RuleOutcome compareCategory(String actual, String operator, String ruleValue) {
        if (actual == null || actual.trim().isEmpty()) return RuleOutcome.UNVERIFIABLE;
        String normActual = normalizeCategory(actual);
        if ("IN".equalsIgnoreCase(operator)) {
            for (String candidate : ruleValue.split(",")) {
                if (normActual.equalsIgnoreCase(normalizeCategory(candidate))) {
                    return RuleOutcome.PASS;
                }
            }
            return RuleOutcome.FAIL;
        } else if ("=".equals(operator)) {
            return normActual.equalsIgnoreCase(normalizeCategory(ruleValue)) ? RuleOutcome.PASS : RuleOutcome.FAIL;
        } else if ("!=".equals(operator)) {
            return !normActual.equalsIgnoreCase(normalizeCategory(ruleValue)) ? RuleOutcome.PASS : RuleOutcome.FAIL;
        }
        return compareString(actual, operator, ruleValue);
    }

    private String normalizeCategory(String s) {
        if (s == null) return "";
        String l = s.toUpperCase().trim();
        if (l.contains("GEN") || l.contains("OPEN")) return "GENERAL";
        if (l.contains("OBC")) return "OBC";
        if (l.contains("SC")) return "SC";
        if (l.contains("ST")) return "ST";
        if (l.contains("EWS")) return "EWS";
        return l;
    }

    private RuleOutcome compareOccupation(String actual, String operator, String ruleValue) {
        if (actual == null || actual.trim().isEmpty()) return RuleOutcome.UNVERIFIABLE;
        String normActual = normalizeOccupation(actual);
        String normRule = normalizeOccupation(ruleValue);

        if ("!=".equals(operator)) {
            return normActual.equals(normRule) ? RuleOutcome.FAIL : RuleOutcome.PASS;
        }
        return (normActual.equals(normRule) || actual.toLowerCase().contains(normRule) || normRule.contains(normActual))
                ? RuleOutcome.PASS
                : RuleOutcome.FAIL;
    }

    private String normalizeOccupation(String s) {
        if (s == null) return "";
        String l = s.toLowerCase().trim();
        if (l.contains("farm") || l.contains("agri") || l.contains("kisan") || l.contains("krishi")) return "farmer";
        if (l.contains("self") || l.contains("entrepreneur") || l.contains("business") || l.contains("startup") || l.contains("artisan") || l.contains("vendor")) return "self-employed";
        if (l.contains("salar") || l.contains("employ") || l.contains("job") || l.contains("worker")) return "salaried";
        if (l.contains("student")) return "student";
        if (l.contains("unemploy")) return "unemployed";
        if (l.contains("home")) return "homemaker";
        if (l.contains("retir")) return "retired";
        return l;
    }

    private RuleOutcome compareEducation(String actual, String operator, String ruleValue) {
        if (actual == null || actual.trim().isEmpty()) return RuleOutcome.UNVERIFIABLE;
        int actualLevel = getEducationRank(actual);
        int ruleLevel = getEducationRank(ruleValue);

        if (operator.equals(">=") || operator.equals("=") || operator.equals("IN")) {
            return actualLevel >= ruleLevel ? RuleOutcome.PASS : RuleOutcome.FAIL;
        } else if (operator.equals("<=")) {
            return actualLevel <= ruleLevel ? RuleOutcome.PASS : RuleOutcome.FAIL;
        } else if (operator.equals("!=")) {
            return actualLevel != ruleLevel ? RuleOutcome.PASS : RuleOutcome.FAIL;
        }
        return compareString(actual, operator, ruleValue);
    }

    private int getEducationRank(String s) {
        if (s == null) return 0;
        String l = s.toLowerCase().trim();
        if (l.contains("doctor") || l.contains("phd") || l.contains("research")) return 6;
        if (l.contains("postgrad") || l.contains("post grad") || l.contains("master") || l.contains("m.phil") || l.contains("m.sc") || l.contains("m.tech")) return 5;
        if (l.contains("graduat") || l.contains("degree") || l.contains("bachelor") || l.contains("college") || l.contains("b.sc") || l.contains("b.a") || l.contains("b.tech")) return 4;
        if (l.contains("diploma") || l.contains("polytechnic")) return 3;
        if (l.contains("12th") || l.contains("hsc") || l.contains("post-matric") || l.contains("class 12") || l.contains("class 11") || l.contains("higher secondary")) return 2;
        if (l.contains("10th") || l.contains("ssc") || l.contains("metric") || l.contains("matric") || l.contains("class 10") || l.contains("class 9") || l.contains("class 8") || l.contains("class 1-10") || l.contains("secondary")) return 1;
        return 0;
    }

    private RuleOutcome compareState(String actual, String operator, String ruleValue) {
        if (actual == null || actual.trim().isEmpty()) return RuleOutcome.UNVERIFIABLE;
        if (ruleValue == null || ruleValue.trim().isEmpty() || ruleValue.equalsIgnoreCase("All India") || ruleValue.equalsIgnoreCase("National") || ruleValue.equalsIgnoreCase("Central")) {
            return RuleOutcome.PASS;
        }
        return compareString(actual, operator, ruleValue);
    }

    private RuleOutcome compareString(String actual, String operator, String ruleValue) {
        if (actual == null || actual.trim().isEmpty()) return RuleOutcome.UNVERIFIABLE;
        boolean pass;
        switch (operator) {
            case "IN": {
                pass = false;
                for (String candidate : ruleValue.split(",")) {
                    if (candidate.trim().equalsIgnoreCase(actual.trim())) {
                        pass = true;
                        break;
                    }
                }
                break;
            }
            case "=": pass = actual.trim().equalsIgnoreCase(ruleValue.trim()); break;
            case "!=": pass = !actual.trim().equalsIgnoreCase(ruleValue.trim()); break;
            default: return RuleOutcome.UNVERIFIABLE;
        }
        return pass ? RuleOutcome.PASS : RuleOutcome.FAIL;
    }

    /** Section 5.3 — STRONG before PARTIAL; within a tier, soonest deadline first, then by category. */
    private List<SchemeMatch> rank(List<SchemeMatch> matches) {
        matches.sort(
                Comparator.comparingInt((SchemeMatch m) -> m.getConfidence().ordinal())
                        .thenComparing(m -> m.getScheme().getDeadline(), Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(m -> m.getScheme().getCategoryName())
        );
        return matches;
    }
}
