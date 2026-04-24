import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateQuestions } from "@/lib/questions/generator";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fixtureId: string }> }
) {
  const { fixtureId } = await params;
  const supabase = createServiceClient();

  // Check if questions already exist for this fixture
  const { data: existing } = await supabase
    .from("questions")
    .select("id")
    .eq("fixture_id", fixtureId)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ ready: true, cached: true });
  }

  // Get fixture and league details
  const { data: fixture } = await supabase
    .from("fixtures")
    .select("league_id, leagues(question_mode)")
    .eq("id", fixtureId)
    .single();

  if (!fixture) {
    return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
  }

  // Get previously used questions in this league for deduplication
  const { data: usedQuestions } = await supabase
    .from("questions")
    .select("question_text, fixtures!inner(league_id)")
    .eq("fixtures.league_id", fixture.league_id)
    .limit(50);

  const exclusions = usedQuestions?.map((q) => q.question_text) ?? [];
  const questionMode = (fixture.leagues as any)?.question_mode ?? "general";

  try {
    const questions = await generateQuestions(
      { questionMode, excludeQuestions: exclusions },
      async (prompt: string) => {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        });
        const block = response.content[0];
        return block.type === "text" ? block.text : "";
      }
    );

    // Store questions in DB
    const questionRows = questions.map((q, i) => ({
      fixture_id: fixtureId,
      question_number: i + 1,
      question_text: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      category: q.category,
      difficulty: q.difficulty,
    }));

    const { error } = await supabase.from("questions").insert(questionRows);

    if (error) {
      return NextResponse.json(
        { error: "Failed to store questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ready: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
