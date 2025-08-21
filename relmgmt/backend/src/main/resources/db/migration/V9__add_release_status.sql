-- Add status column to releases and index
ALTER TABLE releases ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PLANNING';
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);

