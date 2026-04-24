import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Verify cron secret (Vercel cron sends this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Find fixtures past deadline that are still pending
  const { data: expired } = await supabase
    .from("fixtures")
    .select("id, league_id, home_user_id, away_user_id, round")
    .eq("status", "pending")
    .lt("deadline", new Date().toISOString());

  if (!expired || expired.length === 0) {
    return NextResponse.json({ expired: 0 });
  }

  // Mark each as expired with 0-0 (0 points both)
  for (const fixture of expired) {
    await supabase
      .from("fixtures")
      .update({
        status: "expired",
        home_score: 0,
        away_score: 0,
        played_at: new Date().toISOString(),
      })
      .eq("id", fixture.id);

    // Update stats: played +1, lost +1 for both (0 points, it's a loss not a draw)
    for (const userId of [fixture.home_user_id, fixture.away_user_id]) {
      await supabase.rpc("increment_member_stats", {
        p_league_id: fixture.league_id,
        p_user_id: userId,
        p_points: 0,
        p_won: 0,
        p_drawn: 0,
        p_lost: 1,
        p_questions_correct: 0,
        p_questions_total: 0,
      });
    }
  }

  // Check for round advancement in affected leagues
  const affectedLeagues = [...new Set(expired.map((f) => f.league_id))];

  for (const leagueId of affectedLeagues) {
    const { data: league } = await supabase
      .from("leagues")
      .select("current_round")
      .eq("id", leagueId)
      .single();

    if (!league) continue;

    const { data: pending } = await supabase
      .from("fixtures")
      .select("id")
      .eq("league_id", leagueId)
      .eq("round", league.current_round)
      .in("status", ["pending", "in_progress"]);

    if (!pending || pending.length === 0) {
      // Check if there's a next round
      const { data: nextRound } = await supabase
        .from("fixtures")
        .select("id")
        .eq("league_id", leagueId)
        .eq("round", league.current_round + 1)
        .limit(1);

      if (nextRound && nextRound.length > 0) {
        await supabase
          .from("leagues")
          .update({ current_round: league.current_round + 1 })
          .eq("id", leagueId);
      } else {
        await supabase
          .from("leagues")
          .update({ status: "completed" })
          .eq("id", leagueId);
      }
    }
  }

  return NextResponse.json({ expired: expired.length });
}
