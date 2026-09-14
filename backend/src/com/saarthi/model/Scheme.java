package com.saarthi.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Scheme {
    private int schemeId;
    private String name;
    private String description;
    private String ministry;
    private int categoryId;
    private String categoryName;
    private String state; // null = Central/nationwide
    private String benefitSummary;
    private String benefitAmount;
    private String applicationUrl;
    private String officialPortal;
    private boolean isActive;
    private LocalDate deadline;
    private String sourceUrl;
    private LocalDate verifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public int getSchemeId() { return schemeId; }
    public void setSchemeId(int schemeId) { this.schemeId = schemeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMinistry() { return ministry; }
    public void setMinistry(String ministry) { this.ministry = ministry; }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getBenefitSummary() { return benefitSummary; }
    public void setBenefitSummary(String benefitSummary) { this.benefitSummary = benefitSummary; }

    public String getBenefitAmount() { return benefitAmount; }
    public void setBenefitAmount(String benefitAmount) { this.benefitAmount = benefitAmount; }

    public String getApplicationUrl() { return applicationUrl; }
    public void setApplicationUrl(String applicationUrl) { this.applicationUrl = applicationUrl; }

    public String getOfficialPortal() { return officialPortal; }
    public void setOfficialPortal(String officialPortal) { this.officialPortal = officialPortal; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public LocalDate getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDate verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
