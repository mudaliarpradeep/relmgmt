package com.polycoder.relmgmt.entity;

/**
 * Enum representing the different types of components that can be associated with scope items.
 * Each component type represents a specific technology or system component.
 */
public enum ComponentTypeEnum {
    ETL("ETL"),
    FORGEROCK_IGA("ForgeRock IGA"),
    FORGEROCK_UI("ForgeRock UI"),
    FORGEROCK_IG("ForgeRock IG"),
    FORGEROCK_IDM("ForgeRock IDM"),
    SAILPOINT("SailPoint"),
    FUNCTIONAL_TEST("Functional Test");
    
    private final String displayName;
    
    ComponentTypeEnum(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    /**
     * Get the enum value from its display name.
     * 
     * @param displayName the display name to search for
     * @return the matching enum value or null if not found
     */
    public static ComponentTypeEnum fromDisplayName(String displayName) {
        for (ComponentTypeEnum type : values()) {
            if (type.displayName.equals(displayName)) {
                return type;
            }
        }
        return null;
    }
}
