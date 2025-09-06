package com.polycoder.relmgmt.dto;

import java.time.LocalDate;

/**
 * DTO for weekly allocation data
 */
public class WeeklyAllocationResponse {
    private String weekStart; // YYYY-MM-DD (Monday)
    private Double personDays;
    private String projectName;
    private String projectId;

    // Constructors
    public WeeklyAllocationResponse() {}

    public WeeklyAllocationResponse(String weekStart, Double personDays, String projectName, String projectId) {
        this.weekStart = weekStart;
        this.personDays = personDays;
        this.projectName = projectName;
        this.projectId = projectId;
    }

    // Getters and setters
    public String getWeekStart() {
        return weekStart;
    }

    public void setWeekStart(String weekStart) {
        this.weekStart = weekStart;
    }

    public Double getPersonDays() {
        return personDays;
    }

    public void setPersonDays(Double personDays) {
        this.personDays = personDays;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
}
