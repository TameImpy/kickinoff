export interface ValidatedQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  category: string;
  difficulty: string;
}

export interface ValidationResult {
  valid: boolean;
  questions?: ValidatedQuestion[];
  error?: string;
}

export function validateQuestionResponse(response: unknown): ValidationResult {
  if (!response || typeof response !== "object") {
    return { valid: false, error: "Response must be an object" };
  }

  const data = response as Record<string, unknown>;

  if (!Array.isArray(data.questions)) {
    return { valid: false, error: "Response must contain a questions array" };
  }

  if (data.questions.length !== 10) {
    return { valid: false, error: "Response must contain exactly 10 questions" };
  }

  for (let i = 0; i < data.questions.length; i++) {
    const q = data.questions[i];

    if (!q || typeof q !== "object") {
      return { valid: false, error: `Question ${i + 1} must be an object` };
    }

    if (typeof q.question !== "string" || q.question.length === 0) {
      return { valid: false, error: `Question ${i + 1} must have question text` };
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      return { valid: false, error: `Question ${i + 1} must have exactly 4 options` };
    }

    if (
      typeof q.correct_answer !== "number" ||
      q.correct_answer < 0 ||
      q.correct_answer > 3
    ) {
      return {
        valid: false,
        error: `Question ${i + 1} correct_answer must be 0-3`,
      };
    }
  }

  return { valid: true, questions: data.questions as ValidatedQuestion[] };
}
