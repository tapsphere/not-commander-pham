-- Make template_id nullable for course-generated games
ALTER TABLE brand_customizations 
ALTER COLUMN template_id DROP NOT NULL;