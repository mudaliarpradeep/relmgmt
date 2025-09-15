-- Create resources table
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    employee_number VARCHAR(8) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    project_start_date DATE NOT NULL,
    project_end_date DATE,
    employee_grade VARCHAR(20) NOT NULL,
    skill_function VARCHAR(50) NOT NULL,
    skill_sub_function VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_status CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT chk_employee_grade CHECK (employee_grade IN ('LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6', 'LEVEL_7', 'LEVEL_8', 'LEVEL_9', 'LEVEL_10', 'LEVEL_11', 'LEVEL_12')),
    CONSTRAINT chk_skill_function CHECK (skill_function IN ('FUNCTIONAL_DESIGN', 'TECHNICAL_DESIGN', 'BUILD', 'TEST', 'PLATFORM')),
    CONSTRAINT chk_skill_sub_function CHECK (skill_sub_function IS NULL OR skill_sub_function IN ('TALEND', 'FORGEROCK_IDM', 'FORGEROCK_IG', 'SAILPOINT', 'FORGEROCK_UI', 'AUTOMATED', 'MANUAL'))
);

-- Create indexes for resources table
CREATE INDEX idx_resources_skill_function ON resources(skill_function);
CREATE INDEX idx_resources_skill_sub_function ON resources(skill_sub_function);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_resources_employee_number ON resources(employee_number);
CREATE INDEX idx_resources_email ON resources(email);