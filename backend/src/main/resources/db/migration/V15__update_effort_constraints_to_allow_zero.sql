-- Update CHECK constraints for effort fields to allow 0 PD estimates
-- This migration updates the existing constraints that were enforcing >= 1 to now allow >= 0

-- Drop existing CHECK constraints for scope_items table
ALTER TABLE scope_items
DROP CONSTRAINT IF EXISTS chk_functional_design_days,
DROP CONSTRAINT IF EXISTS chk_sit_days,
DROP CONSTRAINT IF EXISTS chk_uat_days;

-- Add new CHECK constraints that allow 0 PD estimates for scope_items
ALTER TABLE scope_items
ADD CONSTRAINT chk_functional_design_days CHECK (functional_design_days >= 0 AND functional_design_days <= 1000),
ADD CONSTRAINT chk_sit_days CHECK (sit_days >= 0 AND sit_days <= 1000),
ADD CONSTRAINT chk_uat_days CHECK (uat_days >= 0 AND uat_days <= 1000);

-- Drop existing CHECK constraints for components table
ALTER TABLE components
DROP CONSTRAINT IF EXISTS chk_technical_design_days,
DROP CONSTRAINT IF EXISTS chk_build_days;

-- Add new CHECK constraints that allow 0 PD estimates for components
ALTER TABLE components
ADD CONSTRAINT chk_technical_design_days CHECK (technical_design_days >= 0 AND technical_design_days <= 1000),
ADD CONSTRAINT chk_build_days CHECK (build_days >= 0 AND build_days <= 1000);
