-- Migration: 002_update_category_constraint.sql
-- Description: Update foreign key constraint to prevent deletion of categories in use
-- Created: 2024-01-20
-- Author: Shore Agents Development Team

BEGIN;

-- Drop the existing foreign key constraint
ALTER TABLE public.inventory_medical 
DROP CONSTRAINT inventory_medical_category_id_fkey;

-- Add the new foreign key constraint with RESTRICT (prevents deletion if referenced)
ALTER TABLE public.inventory_medical 
ADD CONSTRAINT inventory_medical_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES public.inventory_medical_categories(id) 
ON DELETE RESTRICT;

-- Record this migration as applied
INSERT INTO schema_migrations (version, description) 
VALUES ('002_update_category_constraint', 'Updated category foreign key constraint to prevent deletion of categories in use');

COMMIT; 