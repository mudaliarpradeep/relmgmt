package com.polycoder.relmgmt.entity;

public enum StatusEnum {
    ACTIVE("Active"),
    INACTIVE("Inactive");
    
    private final String displayName;
    
    StatusEnum(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}