import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { sendFixtureNudge } from "@/lib/email/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;

  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: fixture } = await supabase
    .from("fixtures")
    .select(
      "home_user_id, away_user_id, league_id, leagues(name)"
    )
    .eq("id", fixtureId)
    .single();

  if (!fixture) {
    return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
  }

  if (
    fixture.home_user_id !== user.id &&
    fixture.away_user_id !== user.id
  ) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  // Determine opponent
  const opponentId =
    fixture.home_user_id === user.id
      ? fixture.away_user_id
      : fixture.home_user_id;

  // Get user names and emails
  const { data: sender } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const { data: opponent } = await supabase
    .from("users")
    .select("email")
    .eq("id", opponentId)
    .single();

  if (!opponent || !sender) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const leagueName = (fixture.leagues as any)?.name ?? "your league";
  const fixtureUrl = `${process.env.NEXT_PUBLIC_APP_URL}/league/${fixture.league_id}/fixture/${fixtureId}`;

  try {
    await sendFixtureNudge(
      opponent.email,
      sender.display_name,
      leagueName,
      fixtureUrl
    );
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send nudge" },
      { status: 500 }
    );
  }
}
