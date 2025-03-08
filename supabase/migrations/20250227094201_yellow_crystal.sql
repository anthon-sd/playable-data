/*
  # Create articles table

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `slug` (text, unique)
      - `content` (text)
      - `description` (text)
      - `cover_image` (text)
      - `tags` (text array)
      - `status` (text)
      - `author_id` (uuid, references auth.users)
      - `author_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `articles` table
    - Add basic policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  description text,
  cover_image text,
  tags text[],
  status text DEFAULT 'draft',
  author_id uuid REFERENCES auth.users(id),
  author_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Basic policy for authenticated users to read all articles
CREATE POLICY "Authenticated users can read all articles"
  ON articles
  FOR SELECT
  TO authenticated
  USING (true);

-- Basic policy for authenticated users to insert articles
CREATE POLICY "Authenticated users can insert articles"
  ON articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Basic policy for authenticated users to update their own articles
CREATE POLICY "Authenticated users can update their own articles"
  ON articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- Basic policy for authenticated users to delete their own articles
CREATE POLICY "Authenticated users can delete their own articles"
  ON articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);