"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateFixtures } from "@/lib/league/round-robin";
import { useRouter } from "next/navigation";

export default function StartLeagueButton({ leagueId }: { leagueId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch league details and members
    const { data: league } = await supabase
      .from("leagues")
      .select("fixture_window_days")
      .eq("id", leagueId)
      .single();

    const { data: members } = await supabase
      .from("league_members")
      .select("user_id")
      .eq("league_id", leagueId);

    if (!league || !members || members.length < 3) {
      setLoading(false);
      return;
    }

    const playerIds = members.map((m) => m.user_id);
    const fixtures = generateFixtures(
      playerIds,
      leagueId,
      new Date(),
      league.fixture_window_days
    );

    // Insert all fixtures
    const { error: fixtureError } = await supabase.from("fixtures").insert(
      fixtures.map((f) => ({
        league_id: f.leagueId,
        round: f.round,
        home_user_id: f.homeUserId,
        away_user_id: f.awayUserId,
        deadline: f.deadline.toISOString(),
      }))
    );

    if (fixtureError) {
      setLoading(false);
      return;
    }

    // Update league status
    const totalRounds = playerIds.length % 2 === 0
      ? playerIds.length - 1
      : playerIds.length;

    await supabase
      .from("leagues")
      .update({ status: "active", current_round: 1 })
      .eq("id", leagueId);

    router.refresh();
  };

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="w-full bg-primary text-black font-[var(--font-space-grotesk)] font-bold py-4 mb-6 button-clip hover:shadow-[0_0_20px_#00e676] transition-all disabled:opacity-50"
    >
      {loading ? "STARTING..." : "START LEAGUE"}
    </button>
  );
}
