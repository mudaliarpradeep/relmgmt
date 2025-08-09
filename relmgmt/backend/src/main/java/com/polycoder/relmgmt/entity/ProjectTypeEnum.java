package com.polycoder.relmgmt.entity;

public enum ProjectTypeEnum {
    DAY_1("Day 1"),
    DAY_2("Day 2");

    private final String displayName;

    ProjectTypeEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
