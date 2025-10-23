-- Update XP values in scoring formulas for all sub_competencies to match Tab 4
-- New XP structure: L1 = 5 XP, L2 = 10 XP, L3 = 15 XP

UPDATE sub_competencies
SET 
  scoring_formula_level_1 = REPLACE(scoring_formula_level_1, '100 XP', '5 XP'),
  scoring_formula_level_2 = REPLACE(scoring_formula_level_2, '250 XP', '10 XP'),
  scoring_formula_level_3 = REPLACE(scoring_formula_level_3, '500 XP', '15 XP')
WHERE scoring_formula_level_1 IS NOT NULL;