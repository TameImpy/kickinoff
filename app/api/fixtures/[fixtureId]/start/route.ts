import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

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
    .select("home_user_id, away_user_id, started_at, status")
    .eq("id", fixtureId)
    .single();

  if (!fixture) {
    return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
  }

  if (fixture.started_at) {
    return NextResponse.json({
      started_at: fixture.started_at,
    });
  }

  if (
    fixture.home_user_id !== user.id &&
    fixture.away_user_id !== user.id
  ) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  const startedAt = new Date().toISOString();

  await supabase
    .from("fixtures")
    .update({ started_at: startedAt, status: "in_progress" })
    .eq("id", fixtureId);

  return NextResponse.json({ started_at: startedAt });
}
