-- Create allocations table
CREATE TABLE allocations (
    id BIGSERIAL PRIMARY KEY,
    release_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    phase VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    allocation_factor DOUBLE PRECISION NOT NULL,
    allocation_days DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE allocations 
    ADD CONSTRAINT fk_allocations_release 
    FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE;

ALTER TABLE allocations 
    ADD CONSTRAINT fk_allocations_resource 
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE;

-- Add indexes for performance
CREATE INDEX idx_allocations_release_id ON allocations(release_id);
CREATE INDEX idx_allocations_resource_id ON allocations(resource_id);
CREATE INDEX idx_allocations_phase ON allocations(phase);
CREATE INDEX idx_allocations_date_range ON allocations(start_date, end_date);

-- Add check constraints for data integrity
ALTER TABLE allocations 
    ADD CONSTRAINT chk_allocation_factor 
    CHECK (allocation_factor >= 0.5 AND allocation_factor <= 1.0);

ALTER TABLE allocations 
    ADD CONSTRAINT chk_allocation_days 
    CHECK (allocation_days >= 0);

ALTER TABLE allocations 
    ADD CONSTRAINT chk_date_range 
    CHECK (start_date <= end_date);

-- Add unique constraint to prevent duplicate allocations for same resource/phase/date range
CREATE UNIQUE INDEX idx_unique_allocation 
    ON allocations(resource_id, phase, start_date, end_date);
