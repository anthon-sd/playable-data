/*
  # Setup Markdown Articles Structure

  1. New Tables
    - No new tables needed, updating existing articles table

  2. Changes
    - Add frontmatter columns for markdown metadata
    - Add content column for markdown content
    - Add validation for required fields
    - Add updated_at trigger

  3. Security
    - Maintain existing RLS policies
*/

-- Add updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure articles table has all needed columns
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'content') THEN
    ALTER TABLE articles ADD COLUMN content text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'description') THEN
    ALTER TABLE articles ADD COLUMN description text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'cover_image') THEN
    ALTER TABLE articles ADD COLUMN cover_image text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'topics') THEN
    ALTER TABLE articles ADD COLUMN topics text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'status') THEN
    ALTER TABLE articles ADD COLUMN status text DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'featured') THEN
    ALTER TABLE articles ADD COLUMN featured boolean DEFAULT false;
  END IF;

  -- Add updated_at trigger if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at') THEN
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON articles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Add GIN index for topics if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'articles_topics_idx') THEN
    CREATE INDEX articles_topics_idx ON articles USING GIN (topics);
  END IF;
END $$;

-- Add constraints for required fields
ALTER TABLE articles
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN slug SET NOT NULL,
  ADD CONSTRAINT articles_slug_unique UNIQUE (slug);

-- Add check constraints for status
ALTER TABLE articles
  ADD CONSTRAINT articles_status_check 
  CHECK (status IN ('draft', 'published'));