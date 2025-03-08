/*
  # Add topics array to articles table

  1. Changes
    - Add topics array column to articles table
    - Update existing articles to have an empty topics array
    - Add index on topics for better performance

  2. Security
    - No changes to RLS policies needed as we're using existing article permissions
*/

-- Add topics array column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'topics'
  ) THEN
    ALTER TABLE articles ADD COLUMN topics text[] DEFAULT '{}';
    CREATE INDEX articles_topics_idx ON articles USING GIN (topics);
  END IF;
END $$;