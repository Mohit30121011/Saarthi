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

    /** Section 5.1/5.2 — evaluates one scheme's rules against one profile. Returns null for NOT_MATCHED. */
    private SchemeMatch evaluateScheme(Scheme scheme, UserProfile profile, List<EligibilityRule> rules) {
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
            return null; // NOT_MATCHED — confirmed non-match, excluded from the dashboard
        }
        if (!missingFields.isEmpty()) {
            return new SchemeMatch(scheme, SchemeMatch.Confidence.PARTIAL, new ArrayList<>(missingFields));
        }
        return new SchemeMatch(scheme, SchemeMatch.Confidence.STRONG, List.of());
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
            case "gender": return compareString(profile.getGender(), operator, ruleValue);
            case "category": return compareString(profile.getCategory(), operator, ruleValue);
            case "state": return compareString(profile.getState(), operator, ruleValue);
            case "occupation": return compareString(profile.getOccupation(), operator, ruleValue);
            case "education_level": return compareString(profile.getEducationLevel(), operator, ruleValue);
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

    private RuleOutcome compareString(String actual, String operator, String ruleValue) {
        if (actual == null) return RuleOutcome.UNVERIFIABLE;
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
