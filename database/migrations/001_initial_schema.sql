-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Shore Agents Nurse Application
-- Created: 2024-01-20
-- Author: Shore Agents Development Team

-- This migration creates the complete initial schema for the clinic management system

BEGIN;

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create migration tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- Check if this migration has already been applied
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001_initial_schema') THEN
        RAISE EXCEPTION 'Migration 001_initial_schema has already been applied';
    END IF;
END $$;

-- Run the schema creation script
\i ../schema.sql

-- Record this migration as applied
INSERT INTO schema_migrations (version, description) 
VALUES ('001_initial_schema', 'Initial database schema for Shore Agents Nurse Application');

COMMIT; 