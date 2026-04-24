import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { calculateFixtureResult } from "@/lib/league/scoring";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  const supabase = createServiceClient();

  // Get all questions for this fixture
  const { data: questions } = await supabase
    .from("questions")
    .select("home_correct, away_correct")
    .eq("fixture_id", fixtureId);

  if (!questions || questions.length !== 10) {
    return NextResponse.json(
      { error: "Questions incomplete" },
      { status: 400 }
    );
  }

  const homeScore = questions.filter((q) => q.home_correct).length;
  const awayScore = questions.filter((q) => q.away_correct).length;
  const result = calculateFixtureResult(homeScore, awayScore);

  // Get fixture details
  const { data: fixture } = await supabase
    .from("fixtures")
    .select("home_user_id, away_user_id, league_id")
    .eq("id", fixtureId)
    .single();

  if (!fixture) {
    return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
  }

  // Update fixture
  await supabase
    .from("fixtures")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "completed",
      played_at: new Date().toISOString(),
    })
    .eq("id", fixtureId);

  // Update home player stats
  await supabase.rpc("increment_member_stats", {
    p_league_id: fixture.league_id,
    p_user_id: fixture.home_user_id,
    p_points: result.homePoints,
    p_won: result.homeResult === "win" ? 1 : 0,
    p_drawn: result.homeResult === "draw" ? 1 : 0,
    p_lost: result.homeResult === "loss" ? 1 : 0,
    p_questions_correct: homeScore,
    p_questions_total: 5,
  });

  // Update away player stats
  await supabase.rpc("increment_member_stats", {
    p_league_id: fixture.league_id,
    p_user_id: fixture.away_user_id,
    p_points: result.awayPoints,
    p_won: result.awayResult === "win" ? 1 : 0,
    p_drawn: result.awayResult === "draw" ? 1 : 0,
    p_lost: result.awayResult === "loss" ? 1 : 0,
    p_questions_correct: awayScore,
    p_questions_total: 5,
  });

  // Check if all fixtures in the current round are done
  const { data: league } = await supabase
    .from("leagues")
    .select("current_round")
    .eq("id", fixture.league_id)
    .single();

  if (league) {
    const { data: pendingFixtures } = await supabase
      .from("fixtures")
      .select("id")
      .eq("league_id", fixture.league_id)
      .eq("round", league.current_round)
      .in("status", ["pending", "in_progress"]);

    if (!pendingFixtures || pendingFixtures.length === 0) {
      // All fixtures in round done — auto-advance
      const { data: nextRoundFixtures } = await supabase
        .from("fixtures")
        .select("id")
        .eq("league_id", fixture.league_id)
        .eq("round", league.current_round + 1)
        .limit(1);

      if (nextRoundFixtures && nextRoundFixtures.length > 0) {
        await supabase
          .from("leagues")
          .update({ current_round: league.current_round + 1 })
          .eq("id", fixture.league_id);
      } else {
        // No more rounds — league complete
        await supabase
          .from("leagues")
          .update({ status: "completed" })
          .eq("id", fixture.league_id);
      }
    }
  }

  return NextResponse.json({
    homeScore,
    awayScore,
    result,
  });
}
