/*
  # Create user roles table

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `user_roles` table
    - Add policies for admins to manage roles
*/

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read all user roles
CREATE POLICY "Admins can read all user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy for users to read their own role
CREATE POLICY "Users can read their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy for admins to insert user roles
CREATE POLICY "Admins can insert user roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy for admins to update user roles
CREATE POLICY "Admins can update user roles"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy for admins to delete user roles
CREATE POLICY "Admins can delete user roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );