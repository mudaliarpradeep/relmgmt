-- Add manual effort fields to releases table for release-level effort estimates
-- These fields store manually assigned effort estimates for regression testing, smoke testing, and go-live

ALTER TABLE releases 
ADD COLUMN regression_testing_days DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN smoke_testing_days DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN go_live_days DECIMAL(10, 2) DEFAULT 0;

-- Add constraints to ensure effort values are within valid range
ALTER TABLE releases 
ADD CONSTRAINT chk_releases_regression_testing_days CHECK (regression_testing_days >= 0 AND regression_testing_days <= 1000),
ADD CONSTRAINT chk_releases_smoke_testing_days CHECK (smoke_testing_days >= 0 AND smoke_testing_days <= 1000),
ADD CONSTRAINT chk_releases_go_live_days CHECK (go_live_days >= 0 AND go_live_days <= 1000);

-- Add comments to document the new fields
COMMENT ON COLUMN releases.regression_testing_days IS 'Manually assigned effort estimate for regression testing phase (person-days)';
COMMENT ON COLUMN releases.smoke_testing_days IS 'Manually assigned effort estimate for smoke testing phase (person-days)';
COMMENT ON COLUMN releases.go_live_days IS 'Manually assigned effort estimate for go-live phase (person-days)';
