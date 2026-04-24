import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { isAnswerInTime } from "@/lib/fixture/timer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  const body = await request.json();
  const { question_number, answer } = body;

  if (
    typeof question_number !== "number" ||
    question_number < 1 ||
    question_number > 10
  ) {
    return NextResponse.json(
      { error: "Invalid question number" },
      { status: 400 }
    );
  }

  if (typeof answer !== "number" || answer < 0 || answer > 3) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  // Auth check
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Get fixture
  const { data: fixture } = await supabase
    .from("fixtures")
    .select("home_user_id, away_user_id, started_at")
    .eq("id", fixtureId)
    .single();

  if (!fixture) {
    return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
  }

  if (!fixture.started_at) {
    return NextResponse.json(
      { error: "Fixture not started" },
      { status: 400 }
    );
  }

  // Verify user is the active answerer for this question
  const isHomeTurn = question_number % 2 !== 0;
  const activeUserId = isHomeTurn
    ? fixture.home_user_id
    : fixture.away_user_id;

  if (user.id !== activeUserId) {
    return NextResponse.json(
      { error: "Not your turn" },
      { status: 403 }
    );
  }

  // Timing validation (10s + 1s grace)
  const answeredAt = new Date();
  if (!isAnswerInTime(new Date(fixture.started_at), question_number, answeredAt)) {
    return NextResponse.json(
      { error: "Answer submitted too late" },
      { status: 400 }
    );
  }

  // Get the question to check the answer
  const { data: question } = await supabase
    .from("questions")
    .select("correct_answer, answered_by_home, answered_by_away")
    .eq("fixture_id", fixtureId)
    .eq("question_number", question_number)
    .single();

  if (!question) {
    return NextResponse.json(
      { error: "Question not found" },
      { status: 404 }
    );
  }

  // Rate limit: check if already answered
  const isHome = user.id === fixture.home_user_id;
  if (isHome && question.answered_by_home) {
    return NextResponse.json(
      { error: "Already answered" },
      { status: 400 }
    );
  }
  if (!isHome && question.answered_by_away) {
    return NextResponse.json(
      { error: "Already answered" },
      { status: 400 }
    );
  }

  const correct = answer === question.correct_answer;

  // Record the answer
  const updateData = isHome
    ? {
        answered_by_home: true,
        home_answer: answer,
        home_correct: correct,
      }
    : {
        answered_by_away: true,
        away_answer: answer,
        away_correct: correct,
      };

  await supabase
    .from("questions")
    .update(updateData)
    .eq("fixture_id", fixtureId)
    .eq("question_number", question_number);

  // Broadcast result to opponent via Realtime
  const channel = supabase.channel(`fixture:${fixtureId}`);
  await channel.send({
    type: "broadcast",
    event: "answer_submitted",
    payload: {
      questionNumber: question_number,
      correct,
      userId: user.id,
    },
  });
  await supabase.removeChannel(channel);

  return NextResponse.json({
    correct,
    correct_answer: question.correct_answer,
  });
}
