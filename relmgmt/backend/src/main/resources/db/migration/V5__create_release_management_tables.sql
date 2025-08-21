-- Create releases table
CREATE TABLE releases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    identifier VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create phases table
CREATE TABLE phases (
    id SERIAL PRIMARY KEY,
    phase_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    release_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_phases_release FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
    CONSTRAINT chk_phase_type CHECK (phase_type IN ('FUNCTIONAL_DESIGN', 'TECHNICAL_DESIGN', 'BUILD', 'SYSTEM_INTEGRATION_TEST', 'USER_ACCEPTANCE_TEST', 'SMOKE_TESTING', 'PRODUCTION_GO_LIVE')),
    CONSTRAINT chk_phase_dates CHECK (end_date >= start_date)
);

-- Create blockers table
CREATE TABLE blockers (
    id SERIAL PRIMARY KEY,
    description VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL,
    release_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_blockers_release FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
    CONSTRAINT chk_blocker_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'))
);

-- Create indexes for performance
CREATE INDEX idx_phases_release_id ON phases(release_id);
CREATE INDEX idx_phases_phase_type ON phases(phase_type);
CREATE INDEX idx_phases_dates ON phases(start_date, end_date);
CREATE INDEX idx_blockers_release_id ON blockers(release_id);
CREATE INDEX idx_blockers_status ON blockers(status);
CREATE INDEX idx_releases_identifier ON releases(identifier);