-- Update skill sub-function enum to include new values
-- V11: Update skill sub-functions to support enhanced scope item components

-- Drop the existing constraint
ALTER TABLE effort_estimates DROP CONSTRAINT IF EXISTS effort_estimates_skill_sub_function_check;

-- Add the new constraint with updated values
ALTER TABLE effort_estimates 
ADD CONSTRAINT effort_estimates_skill_sub_function_check 
CHECK (skill_sub_function IN (
    'ETL',
    'TALEND', 
    'FORGEROCK_IGA',
    'FORGEROCK_IDM', 
    'FORGEROCK_IG', 
    'SAILPOINT', 
    'FORGEROCK_UI',
    'FUNCTIONAL_TEST',
    'AUTOMATED', 
    'MANUAL'
));

-- Drop the existing constraint for resources table if it exists
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_skill_sub_function_check;

-- Add the new constraint for resources table with updated values
ALTER TABLE resources 
ADD CONSTRAINT resources_skill_sub_function_check 
CHECK (skill_sub_function IN (
    'ETL',
    'TALEND', 
    'FORGEROCK_IGA',
    'FORGEROCK_IDM', 
    'FORGEROCK_IG', 
    'SAILPOINT', 
    'FORGEROCK_UI',
    'FUNCTIONAL_TEST',
    'AUTOMATED', 
    'MANUAL'
));
