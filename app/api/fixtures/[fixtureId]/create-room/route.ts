import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { AccessToken } from "livekit-server-sdk";

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
    .select("home_user_id, away_user_id, video_room_id")
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

  // Get user display name
  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const roomName = `fixture-${fixtureId}`;

  // Store room name if not already set
  if (!fixture.video_room_id) {
    await supabase
      .from("fixtures")
      .update({ video_room_id: roomName })
      .eq("id", fixtureId);
  }

  // Generate participant token
  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: user.id,
      name: profile?.display_name ?? "Player",
    }
  );

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const jwt = await token.toJwt();

  return NextResponse.json({
    room_name: roomName,
    token: jwt,
    livekit_url: process.env.LIVEKIT_URL,
  });
}
