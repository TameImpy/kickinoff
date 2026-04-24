import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string; number: string }> }
) {
  const { fixtureId, number } = await params;
  const questionNumber = parseInt(number);

  if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > 10) {
    return NextResponse.json(
      { error: "Question number must be 1-10" },
      { status: 400 }
    );
  }

  // Verify the requesting user is a participant
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
    .select("home_user_id, away_user_id")
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

  // Get question — WITHOUT the correct answer
  const { data: question } = await supabase
    .from("questions")
    .select("question_number, question_text, options, category, difficulty")
    .eq("fixture_id", fixtureId)
    .eq("question_number", questionNumber)
    .single();

  if (!question) {
    return NextResponse.json(
      { error: "Question not found" },
      { status: 404 }
    );
  }

  // Determine whose turn it is (odd = home, even = away)
  const isHomeTurn = questionNumber % 2 !== 0;
  const activeUserId = isHomeTurn
    ? fixture.home_user_id
    : fixture.away_user_id;

  return NextResponse.json({
    ...question,
    activeUserId,
    isYourTurn: activeUserId === user.id,
  });
}
