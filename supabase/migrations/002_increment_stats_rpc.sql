CREATE OR REPLACE FUNCTION increment_member_stats(
  p_league_id UUID,
  p_user_id UUID,
  p_points INT,
  p_won INT,
  p_drawn INT,
  p_lost INT,
  p_questions_correct INT,
  p_questions_total INT
)
RETURNS void AS $$
BEGIN
  UPDATE league_members
  SET
    points = points + p_points,
    played = played + 1,
    won = won + p_won,
    drawn = drawn + p_drawn,
    lost = lost + p_lost,
    questions_correct = questions_correct + p_questions_correct,
    questions_total = questions_total + p_questions_total
  WHERE league_id = p_league_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
