-- Add GOVERNANCE to skill_function check constraint
ALTER TABLE resources DROP CONSTRAINT chk_skill_function;
ALTER TABLE resources ADD CONSTRAINT chk_skill_function CHECK (skill_function IN ('FUNCTIONAL_DESIGN', 'TECHNICAL_DESIGN', 'BUILD', 'TEST', 'PLATFORM', 'GOVERNANCE')); 