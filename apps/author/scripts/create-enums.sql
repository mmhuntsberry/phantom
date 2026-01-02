-- Create enum types that are missing from the database
-- Run this before using drizzle-kit push

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cohort_type') THEN
        CREATE TYPE "cohort_type" AS ENUM ('beta', 'arc');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'format_pref') THEN
        CREATE TYPE "format_pref" AS ENUM ('web', 'epub', 'pdf');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reading_mode') THEN
        CREATE TYPE "reading_mode" AS ENUM ('partial', 'full');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'completion_method') THEN
        CREATE TYPE "completion_method" AS ENUM ('end_reached', 'survey_submitted');
    END IF;
END $$;

