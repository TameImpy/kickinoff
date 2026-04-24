import type { QuestionMode } from "@/lib/supabase/types";
import { validateQuestionResponse, type ValidatedQuestion } from "./validator";

const BASE_PROMPT = `You are a football trivia question generator. Generate exactly 10 multiple-choice questions for a football quiz. Each question must have exactly 4 answer options with one correct answer.

Rules:
- Questions must be factual and verifiable
- Mix difficulty: 3 easy, 4 medium, 3 hard
- Mix categories: transfers, records, World Cup history, Premier League, international football, managers, stadiums, current season
- All facts must be accurate as of June 2026
- Avoid ambiguous questions where multiple answers could be correct
- Keep question text concise (under 120 characters)
- Keep answer options concise (under 40 characters each)

Respond with ONLY valid JSON, no markdown formatting, no preamble:
{
  "questions": [
    {
      "question": "Which country hosted the 2014 World Cup?",
      "options": ["Brazil", "Germany", "South Africa", "Russia"],
      "correct_answer": 0,
      "category": "world_cup",
      "difficulty": "easy"
    }
  ]
}`;

const WORLD_CUP_ADDENDUM = `

Focus 70% of questions on World Cup 2026 topics: groups, squads, host cities, World Cup history, qualifying, previous tournaments. Remaining 30% general football.`;

const PREMIER_LEAGUE_ADDENDUM = `

Focus 70% of questions on Premier League: current season 2025-26, all-time records, historical seasons, clubs, managers. Remaining 30% general football.`;

export function buildPrompt(
  questionMode: QuestionMode,
  excludeQuestions: string[]
): string {
  let prompt = BASE_PROMPT;

  if (questionMode === "world_cup_2026") {
    prompt += WORLD_CUP_ADDENDUM;
  } else if (questionMode === "premier_league") {
    prompt += PREMIER_LEAGUE_ADDENDUM;
  }

  if (excludeQuestions.length > 0) {
    prompt += `\n\nNever repeat these previously used questions:\n${excludeQuestions.map((q) => `- ${q}`).join("\n")}`;
  }

  return prompt;
}

export interface GenerateQuestionsOptions {
  questionMode: QuestionMode;
  excludeQuestions?: string[];
}

export async function generateQuestions(
  options: GenerateQuestionsOptions,
  callApi: (prompt: string) => Promise<string>
): Promise<ValidatedQuestion[]> {
  const prompt = buildPrompt(
    options.questionMode,
    options.excludeQuestions ?? []
  );

  const responseText = await callApi(prompt);
  const parsed = JSON.parse(responseText);
  const result = validateQuestionResponse(parsed);

  if (!result.valid || !result.questions) {
    throw new Error(`Invalid question response: ${result.error}`);
  }

  return result.questions;
}
