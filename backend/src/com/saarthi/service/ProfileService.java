package com.saarthi.service;

import com.saarthi.dao.ProfileDAO;
import com.saarthi.model.UserProfile;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.Period;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * All profile business logic lives here (FR2.1-FR2.5) — Controllers only call
 * into this class and serialize whatever it returns.
 */
public class ProfileService {

    private static final List<String> VALID_GENDERS = Arrays.asList("MALE", "FEMALE", "OTHER");
    private static final List<String> VALID_CATEGORIES = Arrays.asList("GENERAL", "OBC", "SC", "ST", "EWS");

    private final ProfileDAO profileDAO = new ProfileDAO();

    public static class ProfileResult {
        public final boolean success;
        public final String errorMessage;
        public final UserProfile profile;

        private ProfileResult(boolean success, String errorMessage, UserProfile profile) {
            this.success = success;
            this.errorMessage = errorMessage;
            this.profile = profile;
        }

        static ProfileResult ok(UserProfile profile) { return new ProfileResult(true, null, profile); }
        static ProfileResult fail(String message) { return new ProfileResult(false, message, null); }
    }

    /** FR2.3 */
    public Optional<UserProfile> getProfile(int userId) throws SQLException {
        return profileDAO.findByUserId(userId);
    }

    /** FR2.1/FR2.3/FR2.5 */
    public ProfileResult upsertProfile(int userId, UserProfile profile) throws SQLException {
        String validationError = validate(profile);
        if (validationError != null) {
            return ProfileResult.fail(validationError);
        }
        profile.setUserId(userId);
        profileDAO.upsert(profile);
        return ProfileResult.ok(profileDAO.findByUserId(userId).orElse(profile));
    }

    /** FR2.5 — reject clearly invalid values before persistence. */
    private String validate(UserProfile profile) {
        LocalDate dob = profile.getDateOfBirth();
        if (dob != null) {
            if (dob.isAfter(LocalDate.now())) {
                return "Date of birth cannot be in the future.";
            }
            int age = Period.between(dob, LocalDate.now()).getYears();
            if (age < 0 || age > 120) {
                return "Date of birth must correspond to an age between 0 and 120.";
            }
        }

        BigDecimal income = profile.getAnnualIncome();
        if (income != null && income.signum() < 0) {
            return "Annual income cannot be negative.";
        }

        String gender = profile.getGender();
        if (gender != null && !VALID_GENDERS.contains(gender)) {
            return "Gender must be one of MALE, FEMALE, OTHER.";
        }

        String category = profile.getCategory();
        if (category != null && !VALID_CATEGORIES.contains(category)) {
            return "Category must be one of GENERAL, OBC, SC, ST, EWS.";
        }

        return null;
    }
}
