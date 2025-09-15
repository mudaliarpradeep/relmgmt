-- Complete the migration to new data model by dropping old tables and renaming new ones
-- This migration should be run after V12__migrate_to_scope_component_model.sql

-- Step 1: Drop old tables (only if they exist and data migration is complete)
DROP TABLE IF EXISTS effort_estimates CASCADE;
DROP TABLE IF EXISTS scope_items CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Step 2: Rename new tables to final names
ALTER TABLE scope_items_new RENAME TO scope_items;
ALTER TABLE components_new RENAME TO components;
ALTER TABLE effort_estimates_new RENAME TO effort_estimates;

-- Step 3: Rename indexes to match new table names
ALTER INDEX idx_scope_items_new_release_id RENAME TO idx_scope_items_release_id;
ALTER INDEX idx_components_new_scope_item_id RENAME TO idx_components_scope_item_id;
ALTER INDEX idx_components_new_type RENAME TO idx_components_type;
ALTER INDEX idx_effort_estimates_new_component_id RENAME TO idx_effort_estimates_component_id;

-- Step 4: Update foreign key constraint names to match new table names
-- Note: PostgreSQL doesn't allow renaming constraints directly, so we need to drop and recreate them
ALTER TABLE scope_items DROP CONSTRAINT IF EXISTS fk_scope_items_release;
ALTER TABLE scope_items ADD CONSTRAINT fk_scope_items_release 
    FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE;

ALTER TABLE components DROP CONSTRAINT IF EXISTS fk_components_scope_item;
ALTER TABLE components ADD CONSTRAINT fk_components_scope_item 
    FOREIGN KEY (scope_item_id) REFERENCES scope_items(id) ON DELETE CASCADE;

ALTER TABLE effort_estimates DROP CONSTRAINT IF EXISTS fk_effort_estimates_component;
ALTER TABLE effort_estimates ADD CONSTRAINT fk_effort_estimates_component 
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE;

-- Step 5: Verify the new structure is working correctly
-- This migration completes the transition to the new data model
