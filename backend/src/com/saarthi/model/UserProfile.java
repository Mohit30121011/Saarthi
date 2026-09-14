package com.saarthi.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserProfile {
    private int profileId;
    private int userId;
    private LocalDate dateOfBirth;
    private String gender;        // MALE | FEMALE | OTHER
    private String state;
    private String district;
    private BigDecimal annualIncome;
    private String occupation;
    private String category;      // GENERAL | OBC | SC | ST | EWS
    private String educationLevel;
    private Boolean disabilityStatus;
    private Boolean isBpl;
    private Boolean isMinority;
    private LocalDateTime lastMatchSnapshotAt;
    private LocalDateTime updatedAt;

    public int getProfileId() { return profileId; }
    public void setProfileId(int profileId) { this.profileId = profileId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public BigDecimal getAnnualIncome() { return annualIncome; }
    public void setAnnualIncome(BigDecimal annualIncome) { this.annualIncome = annualIncome; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getEducationLevel() { return educationLevel; }
    public void setEducationLevel(String educationLevel) { this.educationLevel = educationLevel; }

    public Boolean getDisabilityStatus() { return disabilityStatus; }
    public void setDisabilityStatus(Boolean disabilityStatus) { this.disabilityStatus = disabilityStatus; }

    public Boolean getIsBpl() { return isBpl; }
    public void setIsBpl(Boolean isBpl) { this.isBpl = isBpl; }

    public Boolean getIsMinority() { return isMinority; }
    public void setIsMinority(Boolean isMinority) { this.isMinority = isMinority; }

    public LocalDateTime getLastMatchSnapshotAt() { return lastMatchSnapshotAt; }
    public void setLastMatchSnapshotAt(LocalDateTime lastMatchSnapshotAt) { this.lastMatchSnapshotAt = lastMatchSnapshotAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    /** Age is always derived here in Java (never via fn_calculate_age) so the
     * matching engine and every other consumer share one source of truth. */
    public Integer getAge() {
        if (dateOfBirth == null) return null;
        return java.time.Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
}
