-- Allow authenticated users to insert their own user record
CREATE POLICY "Users can insert own profile" ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
