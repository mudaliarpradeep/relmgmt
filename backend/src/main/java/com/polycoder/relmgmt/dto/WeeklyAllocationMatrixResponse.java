package com.polycoder.relmgmt.dto;

import java.util.List;

/**
 * DTO for weekly allocation matrix response
 */
public class WeeklyAllocationMatrixResponse {
    private List<ResourceAllocationResponse> resources;
    private String currentWeekStart;
    private TimeWindowResponse timeWindow;

    // Constructors
    public WeeklyAllocationMatrixResponse() {}

    public WeeklyAllocationMatrixResponse(List<ResourceAllocationResponse> resources, 
                                        String currentWeekStart, 
                                        TimeWindowResponse timeWindow) {
        this.resources = resources;
        this.currentWeekStart = currentWeekStart;
        this.timeWindow = timeWindow;
    }

    // Getters and setters
    public List<ResourceAllocationResponse> getResources() {
        return resources;
    }

    public void setResources(List<ResourceAllocationResponse> resources) {
        this.resources = resources;
    }

    public String getCurrentWeekStart() {
        return currentWeekStart;
    }

    public void setCurrentWeekStart(String currentWeekStart) {
        this.currentWeekStart = currentWeekStart;
    }

    public TimeWindowResponse getTimeWindow() {
        return timeWindow;
    }

    public void setTimeWindow(TimeWindowResponse timeWindow) {
        this.timeWindow = timeWindow;
    }
}
