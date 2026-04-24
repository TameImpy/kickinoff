import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  const { leagueId } = await params;
  const body = await request.json();
  const { fixture_window_days } = body;

  if (![1, 3, 5, 7, 14].includes(fixture_window_days)) {
    return NextResponse.json(
      { error: "Invalid round duration" },
      { status: 400 }
    );
  }

  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: league } = await supabase
    .from("leagues")
    .select("created_by")
    .eq("id", leagueId)
    .single();

  if (!league) {
    return NextResponse.json({ error: "League not found" }, { status: 404 });
  }

  if (league.created_by !== user.id) {
    return NextResponse.json(
      { error: "Only the creator can change settings" },
      { status: 403 }
    );
  }

  await supabase
    .from("leagues")
    .update({ fixture_window_days })
    .eq("id", leagueId);

  return NextResponse.json({ updated: true });
}
