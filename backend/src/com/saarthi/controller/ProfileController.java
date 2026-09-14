package com.saarthi.controller;

import com.google.gson.JsonObject;
import com.saarthi.model.UserProfile;
import com.saarthi.service.ProfileService;
import com.saarthi.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Controller layer per SRS Section 2.4 — no SQL, no business logic. Only:
 * parse request -> call Service -> write JSON. AuthFilter has already
 * populated the "userId" request attribute for this route (FR2.3).
 */
@WebServlet("/api/profile")
public class ProfileController extends HttpServlet {

    private final ProfileService profileService = new ProfileService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int userId = (int) req.getAttribute("userId");
        try {
            Optional<UserProfile> profile = profileService.getProfile(userId);
            if (!profile.isPresent()) {
                JsonUtil.writeError(resp, 404, "Profile not yet created.");
                return;
            }
            JsonUtil.writeJson(resp, 200, toProfileResponse(profile.get()));
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        int userId = (int) req.getAttribute("userId");
        JsonObject body = readJsonBody(req);
        UserProfile profile = fromRequestBody(body);

        try {
            ProfileService.ProfileResult result = profileService.upsertProfile(userId, profile);
            if (!result.success) {
                JsonUtil.writeError(resp, 400, result.errorMessage);
                return;
            }
            JsonUtil.writeJson(resp, 200, toProfileResponse(result.profile));
        } catch (SQLException e) {
            JsonUtil.writeError(resp, 500, "A server error occurred. Please try again.");
        }
    }

    private UserProfile fromRequestBody(JsonObject body) {
        UserProfile profile = new UserProfile();
        if (body == null) return profile;

        profile.setDateOfBirth(getDate(body, "dateOfBirth"));
        profile.setGender(getString(body, "gender"));
        profile.setState(getString(body, "state"));
        profile.setDistrict(getString(body, "district"));
        profile.setAnnualIncome(getDecimal(body, "annualIncome"));
        profile.setOccupation(getString(body, "occupation"));
        profile.setCategory(getString(body, "category"));
        profile.setEducationLevel(getString(body, "educationLevel"));
        profile.setDisabilityStatus(getBoolean(body, "disabilityStatus"));
        profile.setIsBpl(getBoolean(body, "isBpl"));
        profile.setIsMinority(getBoolean(body, "isMinority"));
        return profile;
    }

    private Object toProfileResponse(UserProfile p) {
        return new ProfileResponse(
                p.getDateOfBirth() == null ? null : p.getDateOfBirth().toString(),
                p.getAge(),
                p.getGender(),
                p.getState(),
                p.getDistrict(),
                p.getAnnualIncome(),
                p.getOccupation(),
                p.getCategory(),
                p.getEducationLevel(),
                p.getDisabilityStatus(),
                p.getIsBpl(),
                p.getIsMinority(),
                p.getUpdatedAt() == null ? null : p.getUpdatedAt().toString()
        );
    }

    private static final class ProfileResponse {
        public final String dateOfBirth;
        public final Integer age;
        public final String gender;
        public final String state;
        public final String district;
        public final BigDecimal annualIncome;
        public final String occupation;
        public final String category;
        public final String educationLevel;
        public final Boolean disabilityStatus;
        public final Boolean isBpl;
        public final Boolean isMinority;
        public final String updatedAt;

        ProfileResponse(String dateOfBirth, Integer age, String gender, String state, String district,
                         BigDecimal annualIncome, String occupation, String category, String educationLevel,
                         Boolean disabilityStatus, Boolean isBpl, Boolean isMinority, String updatedAt) {
            this.dateOfBirth = dateOfBirth;
            this.age = age;
            this.gender = gender;
            this.state = state;
            this.district = district;
            this.annualIncome = annualIncome;
            this.occupation = occupation;
            this.category = category;
            this.educationLevel = educationLevel;
            this.disabilityStatus = disabilityStatus;
            this.isBpl = isBpl;
            this.isMinority = isMinority;
            this.updatedAt = updatedAt;
        }
    }

    private JsonObject readJsonBody(HttpServletRequest req) throws IOException {
        try (BufferedReader reader = req.getReader()) {
            String raw = reader.lines().collect(Collectors.joining());
            return JsonUtil.gson().fromJson(raw, JsonObject.class);
        }
    }

    private String getString(JsonObject obj, String key) {
        if (!obj.has(key) || obj.get(key).isJsonNull()) return null;
        String v = obj.get(key).getAsString();
        return v.trim().isEmpty() ? null : v.trim();
    }

    private LocalDate getDate(JsonObject obj, String key) {
        String v = getString(obj, key);
        return v == null ? null : LocalDate.parse(v);
    }

    private BigDecimal getDecimal(JsonObject obj, String key) {
        if (!obj.has(key) || obj.get(key).isJsonNull()) return null;
        return obj.get(key).getAsBigDecimal();
    }

    private Boolean getBoolean(JsonObject obj, String key) {
        if (!obj.has(key) || obj.get(key).isJsonNull()) return null;
        return obj.get(key).getAsBoolean();
    }
}
