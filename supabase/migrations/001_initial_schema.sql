-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leagues
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'active', 'completed')),
  max_players INT DEFAULT 6 CHECK (max_players >= 2 AND max_players <= 8),
  fixture_window_days INT DEFAULT 7,
  question_mode TEXT DEFAULT 'general' CHECK (question_mode IN ('general', 'world_cup_2026', 'premier_league')),
  current_round INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- League Members
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  points INT DEFAULT 0,
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  drawn INT DEFAULT 0,
  lost INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  questions_total INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- Fixtures
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
  round INT NOT NULL,
  home_user_id UUID REFERENCES users(id) NOT NULL,
  away_user_id UUID REFERENCES users(id) NOT NULL,
  home_score INT,
  away_score INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')),
  started_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  video_room_id TEXT,
  played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INT NOT NULL,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  answered_by_home BOOLEAN DEFAULT FALSE,
  home_answer INT,
  home_correct BOOLEAN,
  answered_by_away BOOLEAN DEFAULT FALSE,
  away_answer INT,
  away_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_fixtures_league ON fixtures(league_id, round);
CREATE INDEX idx_fixtures_users ON fixtures(home_user_id, away_user_id);
CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);
CREATE INDEX idx_questions_fixture ON questions(fixture_id, question_number);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their leagues" ON leagues FOR SELECT
  USING (id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can create leagues" ON leagues FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Anyone can view league by invite code" ON leagues FOR SELECT
  USING (true);

ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view league members" ON league_members FOR SELECT
  USING (league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can join leagues" ON league_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view fixtures" ON fixtures FOR SELECT
  USING (league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid()));

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- No client-facing SELECT policy — questions served exclusively via API routes
