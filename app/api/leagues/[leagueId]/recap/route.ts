import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  const { leagueId } = await params;
  const supabase = createServiceClient();

  // Check for cached recap
  const { data: league } = await supabase
    .from("leagues")
    .select("name, status")
    .eq("id", leagueId)
    .single();

  if (!league || league.status !== "completed") {
    return NextResponse.json(
      { error: "League not completed" },
      { status: 400 }
    );
  }

  // Get all fixtures with results
  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(
      "round, home_score, away_score, status, home_user:users!fixtures_home_user_id_fkey(display_name), away_user:users!fixtures_away_user_id_fkey(display_name)"
    )
    .eq("league_id", leagueId)
    .order("round", { ascending: true });

  if (!fixtures || fixtures.length === 0) {
    return NextResponse.json({ error: "No fixtures found" }, { status: 404 });
  }

  // Get final standings
  const { data: members } = await supabase
    .from("league_members")
    .select("points, won, drawn, lost, users(display_name)")
    .eq("league_id", leagueId)
    .order("points", { ascending: false });

  // Build the data summary for Claude
  const fixturesSummary = fixtures
    .map((f: any) => {
      const home = f.home_user?.display_name ?? "Player";
      const away = f.away_user?.display_name ?? "Player";
      if (f.status === "expired") return `Round ${f.round}: ${home} vs ${away} — EXPIRED`;
      return `Round ${f.round}: ${home} ${f.home_score}-${f.away_score} ${away}`;
    })
    .join("\n");

  const standingsSummary = (members ?? [])
    .map(
      (m: any, i: number) =>
        `${i + 1}. ${m.users?.display_name ?? "Player"} — ${m.points}pts (W${m.won} D${m.drawn} L${m.lost})`
    )
    .join("\n");

  // Generate text recap via Claude
  const recapPrompt = `Here are the full results and final standings of a football quiz league called "${league.name}".

Results:
${fixturesSummary}

Final Standings:
${standingsSummary}

Write a 150-word dramatic season recap in the style of a Sky Sports end-of-season montage narration. Mention key moments, upsets, streaks, and the title race. Use the players' actual names. Make it feel epic and emotional. Do not use any markdown formatting.`;

  try {
    const anthropic = new Anthropic();
    const recapResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{ role: "user", content: recapPrompt }],
    });

    const recapText =
      recapResponse.content[0].type === "text"
        ? recapResponse.content[0].text
        : "";

    // Generate audio via OpenAI TTS
    const openai = new OpenAI();
    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: recapText,
    });

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");

    return NextResponse.json({
      text: recapText,
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      winner: (members?.[0] as any)?.users?.display_name ?? "Winner",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate recap" },
      { status: 500 }
    );
  }
}
