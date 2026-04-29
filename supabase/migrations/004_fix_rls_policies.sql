-- Fix league_members RLS: allow users to see their own memberships
DROP POLICY IF EXISTS "Members can view league members" ON league_members;

-- Allow users to see any league_members row for leagues they belong to
CREATE POLICY "Users can view league members" ON league_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
  );

-- Fix leagues RLS: the existing "Members can view their leagues" policy
-- requires being in league_members first, but we also need to see leagues
-- we just created. The "Anyone can view league by invite code" policy
-- already allows SELECT with USING(true), so we're covered.
-- But let's also add UPDATE for creator
CREATE POLICY "Creator can update league" ON leagues FOR UPDATE
  USING (auth.uid() = created_by);

-- Fix fixtures: allow service role to insert (for fixture generation)
-- Client inserts fixtures via the start-league button using anon key,
-- so we need an INSERT policy
CREATE POLICY "Members can insert fixtures" ON fixtures FOR INSERT
  WITH CHECK (
    league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid())
  );

-- Allow fixture status updates by participants
CREATE POLICY "Participants can update fixtures" ON fixtures FOR UPDATE
  USING (home_user_id = auth.uid() OR away_user_id = auth.uid());
