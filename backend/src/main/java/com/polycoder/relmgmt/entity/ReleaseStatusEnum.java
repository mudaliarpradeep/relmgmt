package com.polycoder.relmgmt.entity;

public enum ReleaseStatusEnum {
    PLANNING("Planning"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    ON_HOLD("On Hold"),
    CANCELLED("Cancelled");

    private final String displayName;

    ReleaseStatusEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}


