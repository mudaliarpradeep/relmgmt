-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    type VARCHAR(20) NOT NULL CHECK (type IN ('DAY_1', 'DAY_2')),
    release_id BIGINT NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scope_items table
CREATE TABLE scope_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create effort_estimates table
CREATE TABLE effort_estimates (
    id SERIAL PRIMARY KEY,
    skill_function VARCHAR(50) NOT NULL CHECK (skill_function IN ('FUNCTIONAL_DESIGN', 'TECHNICAL_DESIGN', 'BUILD', 'TEST', 'PLATFORM', 'GOVERNANCE')),
    skill_sub_function VARCHAR(50) CHECK (skill_sub_function IN ('TALEND', 'FORGEROCK_IDM', 'FORGEROCK_IG', 'SAILPOINT', 'FORGEROCK_UI', 'AUTOMATED', 'MANUAL')),
    phase VARCHAR(50) NOT NULL CHECK (phase IN ('FUNCTIONAL_DESIGN', 'TECHNICAL_DESIGN', 'BUILD', 'SIT', 'UAT', 'SMOKE_TESTING', 'PRODUCTION_GO_LIVE')),
    effort_days DOUBLE PRECISION NOT NULL CHECK (effort_days > 0),
    scope_item_id BIGINT NOT NULL REFERENCES scope_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_projects_release_id ON projects(release_id);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_name ON projects(name);

CREATE INDEX idx_scope_items_project_id ON scope_items(project_id);
CREATE INDEX idx_scope_items_name ON scope_items(name);

CREATE INDEX idx_effort_estimates_scope_item_id ON effort_estimates(scope_item_id);
CREATE INDEX idx_effort_estimates_skill_function ON effort_estimates(skill_function);
CREATE INDEX idx_effort_estimates_skill_sub_function ON effort_estimates(skill_sub_function);
CREATE INDEX idx_effort_estimates_phase ON effort_estimates(phase);

-- Create unique constraints
CREATE UNIQUE INDEX idx_projects_release_name ON projects(release_id, name);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scope_items_updated_at BEFORE UPDATE ON scope_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_effort_estimates_updated_at BEFORE UPDATE ON effort_estimates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

