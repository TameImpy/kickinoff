import { describe, it, expect, vi } from "vitest";
import { generateQuestions, buildPrompt } from "./generator";

describe("buildPrompt", () => {
  it("includes general football instructions for general mode", () => {
    const prompt = buildPrompt("general", []);
    expect(prompt).toContain("football trivia");
    expect(prompt).toContain("10 multiple-choice questions");
    expect(prompt).not.toContain("World Cup 2026");
    expect(prompt).not.toContain("Premier League:");
  });

  it("includes World Cup focus for world_cup_2026 mode", () => {
    const prompt = buildPrompt("world_cup_2026", []);
    expect(prompt).toContain("World Cup 2026");
    expect(prompt).toContain("70%");
  });

  it("includes Premier League focus for premier_league mode", () => {
    const prompt = buildPrompt("premier_league", []);
    expect(prompt).toContain("Premier League");
    expect(prompt).toContain("70%");
  });

  it("includes exclusion list when provided", () => {
    const exclusions = [
      "Which country hosted the 2014 World Cup?",
      "Who won the 2018 World Cup?",
    ];
    const prompt = buildPrompt("general", exclusions);
    expect(prompt).toContain("Which country hosted the 2014 World Cup?");
    expect(prompt).toContain("Who won the 2018 World Cup?");
  });
});

describe("generateQuestions", () => {
  const validQuestion = {
    question: "Which country hosted the 2014 World Cup?",
    options: ["Brazil", "Germany", "South Africa", "Russia"],
    correct_answer: 0,
    category: "world_cup",
    difficulty: "easy",
  };

  it("returns validated questions from a successful API call", async () => {
    const fakeApi = vi.fn().mockResolvedValue(
      JSON.stringify({ questions: Array(10).fill(validQuestion) })
    );

    const questions = await generateQuestions(
      { questionMode: "general" },
      fakeApi
    );

    expect(questions).toHaveLength(10);
    expect(fakeApi).toHaveBeenCalledOnce();
    expect(fakeApi.mock.calls[0][0]).toContain("football trivia");
  });

  it("throws on invalid API response", async () => {
    const fakeApi = vi.fn().mockResolvedValue(
      JSON.stringify({ questions: [] })
    );

    await expect(
      generateQuestions({ questionMode: "general" }, fakeApi)
    ).rejects.toThrow("Invalid question response");
  });

  it("throws on malformed JSON", async () => {
    const fakeApi = vi.fn().mockResolvedValue("not json at all");

    await expect(
      generateQuestions({ questionMode: "general" }, fakeApi)
    ).rejects.toThrow();
  });

  it("passes exclusions to the prompt", async () => {
    const fakeApi = vi.fn().mockResolvedValue(
      JSON.stringify({ questions: Array(10).fill(validQuestion) })
    );

    await generateQuestions(
      {
        questionMode: "general",
        excludeQuestions: ["Previously used question?"],
      },
      fakeApi
    );

    expect(fakeApi.mock.calls[0][0]).toContain("Previously used question?");
  });
});
