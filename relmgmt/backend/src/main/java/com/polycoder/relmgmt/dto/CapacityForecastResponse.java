package com.polycoder.relmgmt.dto;

import java.time.LocalDate;

public class CapacityForecastResponse {
    private Long resourceId;
    private String resourceName;
    private LocalDate weekStarting;
    private Double allocatedDays;
    private Double capacity;
    private Double availableDays;

    public CapacityForecastResponse() {}

    public CapacityForecastResponse(Long resourceId, String resourceName, LocalDate weekStarting,
                                    Double allocatedDays, Double capacity, Double availableDays) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.weekStarting = weekStarting;
        this.allocatedDays = allocatedDays;
        this.capacity = capacity;
        this.availableDays = availableDays;
    }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    public LocalDate getWeekStarting() { return weekStarting; }
    public void setWeekStarting(LocalDate weekStarting) { this.weekStarting = weekStarting; }
    public Double getAllocatedDays() { return allocatedDays; }
    public void setAllocatedDays(Double allocatedDays) { this.allocatedDays = allocatedDays; }
    public Double getCapacity() { return capacity; }
    public void setCapacity(Double capacity) { this.capacity = capacity; }
    public Double getAvailableDays() { return availableDays; }
    public void setAvailableDays(Double availableDays) { this.availableDays = availableDays; }
}





