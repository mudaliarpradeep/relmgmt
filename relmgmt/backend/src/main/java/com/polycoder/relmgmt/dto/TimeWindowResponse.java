package com.polycoder.relmgmt.dto;

/**
 * DTO for time window information
 */
public class TimeWindowResponse {
    private String startWeek;
    private String endWeek;
    private Integer totalWeeks;

    // Constructors
    public TimeWindowResponse() {}

    public TimeWindowResponse(String startWeek, String endWeek, Integer totalWeeks) {
        this.startWeek = startWeek;
        this.endWeek = endWeek;
        this.totalWeeks = totalWeeks;
    }

    // Getters and setters
    public String getStartWeek() {
        return startWeek;
    }

    public void setStartWeek(String startWeek) {
        this.startWeek = startWeek;
    }

    public String getEndWeek() {
        return endWeek;
    }

    public void setEndWeek(String endWeek) {
        this.endWeek = endWeek;
    }

    public Integer getTotalWeeks() {
        return totalWeeks;
    }

    public void setTotalWeeks(Integer totalWeeks) {
        this.totalWeeks = totalWeeks;
    }
}
