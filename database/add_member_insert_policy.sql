-- Add INSERT policy for members table
-- Allows authenticated users to create their own member record during registration

CREATE POLICY "Users can insert their own member record"
  ON members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
