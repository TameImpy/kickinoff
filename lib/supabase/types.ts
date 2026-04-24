export type LeagueStatus = "open" | "active" | "completed";
export type QuestionMode = "general" | "world_cup_2026" | "premier_league";
export type FixtureStatus = "pending" | "in_progress" | "completed" | "expired";
export type Difficulty = "easy" | "medium" | "hard";

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface League {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  status: LeagueStatus;
  max_players: number;
  fixture_window_days: number;
  question_mode: QuestionMode;
  current_round: number;
  created_at: string;
}

export interface LeagueMemberRow {
  id: string;
  league_id: string;
  user_id: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  questions_correct: number;
  questions_total: number;
  joined_at: string;
}

export interface FixtureRow {
  id: string;
  league_id: string;
  round: number;
  home_user_id: string;
  away_user_id: string;
  home_score: number | null;
  away_score: number | null;
  status: FixtureStatus;
  started_at: string | null;
  deadline: string;
  video_room_id: string | null;
  played_at: string | null;
  created_at: string;
}

export interface QuestionRow {
  id: string;
  fixture_id: string;
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  category: string | null;
  difficulty: Difficulty | null;
  answered_by_home: boolean;
  home_answer: number | null;
  home_correct: boolean | null;
  answered_by_away: boolean;
  away_answer: number | null;
  away_correct: boolean | null;
  created_at: string;
}
