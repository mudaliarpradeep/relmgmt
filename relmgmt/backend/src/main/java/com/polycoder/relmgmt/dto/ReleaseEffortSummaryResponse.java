package com.polycoder.relmgmt.dto;

import java.time.LocalDateTime;

/**
 * DTO for returning release effort summary data.
 */
public class ReleaseEffortSummaryResponse {
    
    private Long releaseId;
    private Double functionalDesignDays;
    private Double technicalDesignDays;
    private Double buildDays;
    private Double sitDays;
    private Double uatDays;
    private Double regressionTestingDays;
    private Double smokeTestingDays;
    private Double goLiveDays;
    private LocalDateTime calculatedAt;
    
    // Default constructor
    public ReleaseEffortSummaryResponse() {
        this.calculatedAt = LocalDateTime.now();
    }
    
    // Constructor with all fields
    public ReleaseEffortSummaryResponse(Long releaseId, Double functionalDesignDays, Double technicalDesignDays,
                                       Double buildDays, Double sitDays, Double uatDays,
                                       Double regressionTestingDays, Double smokeTestingDays, Double goLiveDays) {
        this.releaseId = releaseId;
        this.functionalDesignDays = functionalDesignDays;
        this.technicalDesignDays = technicalDesignDays;
        this.buildDays = buildDays;
        this.sitDays = sitDays;
        this.uatDays = uatDays;
        this.regressionTestingDays = regressionTestingDays;
        this.smokeTestingDays = smokeTestingDays;
        this.goLiveDays = goLiveDays;
        this.calculatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getReleaseId() {
        return releaseId;
    }
    
    public void setReleaseId(Long releaseId) {
        this.releaseId = releaseId;
    }
    
    public Double getFunctionalDesignDays() {
        return functionalDesignDays;
    }
    
    public void setFunctionalDesignDays(Double functionalDesignDays) {
        this.functionalDesignDays = functionalDesignDays;
    }
    
    public Double getTechnicalDesignDays() {
        return technicalDesignDays;
    }
    
    public void setTechnicalDesignDays(Double technicalDesignDays) {
        this.technicalDesignDays = technicalDesignDays;
    }
    
    public Double getBuildDays() {
        return buildDays;
    }
    
    public void setBuildDays(Double buildDays) {
        this.buildDays = buildDays;
    }
    
    public Double getSitDays() {
        return sitDays;
    }
    
    public void setSitDays(Double sitDays) {
        this.sitDays = sitDays;
    }
    
    public Double getUatDays() {
        return uatDays;
    }
    
    public void setUatDays(Double uatDays) {
        this.uatDays = uatDays;
    }
    
    public Double getRegressionTestingDays() {
        return regressionTestingDays;
    }
    
    public void setRegressionTestingDays(Double regressionTestingDays) {
        this.regressionTestingDays = regressionTestingDays;
    }
    
    public Double getSmokeTestingDays() {
        return smokeTestingDays;
    }
    
    public void setSmokeTestingDays(Double smokeTestingDays) {
        this.smokeTestingDays = smokeTestingDays;
    }
    
    public Double getGoLiveDays() {
        return goLiveDays;
    }
    
    public void setGoLiveDays(Double goLiveDays) {
        this.goLiveDays = goLiveDays;
    }
    
    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }
    
    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
    
    /**
     * Get the total calculated effort days (auto-calculated from scope items).
     * 
     * @return total calculated effort days
     */
    public Double getTotalCalculatedEffortDays() {
        return (functionalDesignDays != null ? functionalDesignDays : 0.0) +
               (technicalDesignDays != null ? technicalDesignDays : 0.0) +
               (buildDays != null ? buildDays : 0.0) +
               (sitDays != null ? sitDays : 0.0) +
               (uatDays != null ? uatDays : 0.0);
    }
    
    /**
     * Get the total manual effort days (manually assigned at release level).
     * 
     * @return total manual effort days
     */
    public Double getTotalManualEffortDays() {
        return (regressionTestingDays != null ? regressionTestingDays : 0.0) +
               (smokeTestingDays != null ? smokeTestingDays : 0.0) +
               (goLiveDays != null ? goLiveDays : 0.0);
    }
    
    /**
     * Get the total effort days (calculated + manual).
     * 
     * @return total effort days
     */
    public Double getTotalEffortDays() {
        return getTotalCalculatedEffortDays() + getTotalManualEffortDays();
    }
    
    @Override
    public String toString() {
        return "ReleaseEffortSummaryResponse{" +
                "releaseId=" + releaseId +
                ", functionalDesignDays=" + functionalDesignDays +
                ", technicalDesignDays=" + technicalDesignDays +
                ", buildDays=" + buildDays +
                ", sitDays=" + sitDays +
                ", uatDays=" + uatDays +
                ", regressionTestingDays=" + regressionTestingDays +
                ", smokeTestingDays=" + smokeTestingDays +
                ", goLiveDays=" + goLiveDays +
                ", totalCalculatedEffortDays=" + getTotalCalculatedEffortDays() +
                ", totalManualEffortDays=" + getTotalManualEffortDays() +
                ", totalEffortDays=" + getTotalEffortDays() +
                ", calculatedAt=" + calculatedAt +
                '}';
    }
}
