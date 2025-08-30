-- Migration script to implement new data model: Release -> Scope Items -> Components
-- This migration eliminates the Project entity and establishes direct relationships

-- Step 1: Create new scope_items table with direct release relationship
CREATE TABLE scope_items_new (
    id SERIAL PRIMARY KEY,
    release_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    functional_design_days DECIMAL(10, 2) NOT NULL DEFAULT 0,
    sit_days DECIMAL(10, 2) NOT NULL DEFAULT 0,
    uat_days DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scope_items_release FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
    CONSTRAINT chk_functional_design_days CHECK (functional_design_days >= 0 AND functional_design_days <= 1000),
    CONSTRAINT chk_sit_days CHECK (sit_days >= 0 AND sit_days <= 1000),
    CONSTRAINT chk_uat_days CHECK (uat_days >= 0 AND uat_days <= 1000)
);

-- Step 2: Create new components table
CREATE TABLE components_new (
    id SERIAL PRIMARY KEY,
    scope_item_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    technical_design_days DECIMAL(10, 2) NOT NULL DEFAULT 0,
    build_days DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_components_scope_item FOREIGN KEY (scope_item_id) REFERENCES scope_items_new(id) ON DELETE CASCADE,
    CONSTRAINT chk_component_type CHECK (component_type IN ('ETL', 'FORGEROCK_IGA', 'FORGEROCK_UI', 'FORGEROCK_IG', 'FORGEROCK_IDM', 'SAILPOINT', 'FUNCTIONAL_TEST')),
    CONSTRAINT chk_technical_design_days CHECK (technical_design_days >= 0 AND technical_design_days <= 1000),
    CONSTRAINT chk_build_days CHECK (build_days >= 0 AND build_days <= 1000)
);

-- Step 3: Update effort_estimates table to link to components instead of scope_items
CREATE TABLE effort_estimates_new (
    id SERIAL PRIMARY KEY,
    component_id BIGINT NOT NULL,
    skill_function VARCHAR(50) NOT NULL,
    skill_sub_function VARCHAR(50),
    phase VARCHAR(50) NOT NULL,
    effort_days DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_effort_estimates_component FOREIGN KEY (component_id) REFERENCES components_new(id) ON DELETE CASCADE,
    CONSTRAINT chk_effort_skill_function CHECK (skill_function IN ('FUNCTIONAL_DESIGN', 'TECHNICAL_DESIGN', 'BUILD', 'TEST', 'PLATFORM')),
    CONSTRAINT chk_effort_phase CHECK (phase IN ('FUNCTIONAL_DESIGN', 'TECHNICAL_DESIGN', 'BUILD', 'SIT', 'UAT', 'SMOKE_TESTING', 'GO_LIVE')),
    CONSTRAINT chk_effort_days CHECK (effort_days >= 0 AND effort_days <= 1000)
);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_scope_items_new_release_id ON scope_items_new(release_id);
CREATE INDEX idx_components_new_scope_item_id ON components_new(scope_item_id);
CREATE INDEX idx_components_new_type ON components_new(component_type);
CREATE INDEX idx_effort_estimates_new_component_id ON effort_estimates_new(component_id);

-- Step 5: Migrate existing data (if any exists)
-- Note: This migration assumes clean data or will create empty tables for new structure
-- If there's existing data, additional migration logic would be needed here

-- Step 6: Drop old tables (after ensuring data migration is complete)
-- DROP TABLE IF EXISTS effort_estimates CASCADE;
-- DROP TABLE IF EXISTS scope_items CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;

-- Step 7: Rename new tables to final names
-- ALTER TABLE scope_items_new RENAME TO scope_items;
-- ALTER TABLE components_new RENAME TO components;
-- ALTER TABLE effort_estimates_new RENAME TO effort_estimates;

-- Note: The actual table renaming and dropping will be done in a separate migration
-- after confirming the new structure works correctly and data migration is complete
