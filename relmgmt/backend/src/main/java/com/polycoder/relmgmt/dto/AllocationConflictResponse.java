package com.polycoder.relmgmt.dto;

import java.time.LocalDate;
import java.util.List;

public class AllocationConflictResponse {
    private Long resourceId;
    private String resourceName;
    private List<WeeklyConflict> weeklyConflicts;

    public AllocationConflictResponse() {}

    public AllocationConflictResponse(Long resourceId, String resourceName, List<WeeklyConflict> weeklyConflicts) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.weeklyConflicts = weeklyConflicts;
    }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }
    public List<WeeklyConflict> getWeeklyConflicts() { return weeklyConflicts; }
    public void setWeeklyConflicts(List<WeeklyConflict> weeklyConflicts) { this.weeklyConflicts = weeklyConflicts; }

    public static class WeeklyConflict {
        private LocalDate weekStarting;
        private double totalAllocation;
        private double standardLoad;
        private double overAllocation;

        public WeeklyConflict() {}

        public WeeklyConflict(LocalDate weekStarting, double totalAllocation, double standardLoad, double overAllocation) {
            this.weekStarting = weekStarting;
            this.totalAllocation = totalAllocation;
            this.standardLoad = standardLoad;
            this.overAllocation = overAllocation;
        }

        public LocalDate getWeekStarting() { return weekStarting; }
        public void setWeekStarting(LocalDate weekStarting) { this.weekStarting = weekStarting; }
        public double getTotalAllocation() { return totalAllocation; }
        public void setTotalAllocation(double totalAllocation) { this.totalAllocation = totalAllocation; }
        public double getStandardLoad() { return standardLoad; }
        public void setStandardLoad(double standardLoad) { this.standardLoad = standardLoad; }
        public double getOverAllocation() { return overAllocation; }
        public void setOverAllocation(double overAllocation) { this.overAllocation = overAllocation; }
    }
}


