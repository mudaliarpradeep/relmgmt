package com.polycoder.relmgmt.dto;

import java.time.LocalDate;

public class ReleaseTimelineRow {
    private Long releaseId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;

    public ReleaseTimelineRow() {}

    public ReleaseTimelineRow(Long releaseId, String name, LocalDate startDate, LocalDate endDate) {
        this.releaseId = releaseId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getReleaseId() { return releaseId; }
    public void setReleaseId(Long releaseId) { this.releaseId = releaseId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}




