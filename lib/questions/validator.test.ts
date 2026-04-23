import { describe, it, expect } from "vitest";
import { validateQuestionResponse } from "./validator";

describe("validateQuestionResponse", () => {
  const validQuestion = {
    question: "Which country hosted the 2014 World Cup?",
    options: ["Brazil", "Germany", "South Africa", "Russia"],
    correct_answer: 0,
    category: "world_cup",
    difficulty: "easy",
  };

  it("accepts a valid 10-question response", () => {
    const response = { questions: Array(10).fill(validQuestion) };
    const result = validateQuestionResponse(response);
    expect(result.valid).toBe(true);
    expect(result.questions).toHaveLength(10);
  });

  it("rejects response with fewer than 10 questions", () => {
    const response = { questions: Array(5).fill(validQuestion) };
    const result = validateQuestionResponse(response);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10 questions");
  });

  it("rejects response with missing questions array", () => {
    const result = validateQuestionResponse({ data: [] });
    expect(result.valid).toBe(false);
  });

  it("rejects question with wrong number of options", () => {
    const bad = { ...validQuestion, options: ["A", "B", "C"] };
    const response = {
      questions: [bad, ...Array(9).fill(validQuestion)],
    };
    const result = validateQuestionResponse(response);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("4 options");
  });

  it("rejects question with correct_answer out of range", () => {
    const bad = { ...validQuestion, correct_answer: 5 };
    const response = {
      questions: [bad, ...Array(9).fill(validQuestion)],
    };
    const result = validateQuestionResponse(response);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("correct_answer");
  });

  it("rejects non-object input", () => {
    const result = validateQuestionResponse("not an object");
    expect(result.valid).toBe(false);
  });
});
