-- Update validator_test_results table to support v3.1 8-check system
-- Keep old columns for backward compatibility but add new structure

ALTER TABLE public.validator_test_results 
ADD COLUMN IF NOT EXISTS v3_1_check_results jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.validator_test_results.v3_1_check_results IS 'Array of 8 automated check results from v3.1 testing framework';

-- Update existing records to have empty v3.1 results
UPDATE public.validator_test_results 
SET v3_1_check_results = '[]'::jsonb 
WHERE v3_1_check_results IS NULL;