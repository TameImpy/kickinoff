import { describe, it, expect } from "vitest";
import { getQuestionWindow, isAnswerInTime } from "./timer";

describe("getQuestionWindow", () => {
  const startedAt = new Date("2026-06-01T20:00:00.000Z");

  it("calculates question 1 window starting after 3s countdown", () => {
    const window = getQuestionWindow(startedAt, 1);
    expect(window.start.toISOString()).toBe("2026-06-01T20:00:03.000Z");
    expect(window.end.toISOString()).toBe("2026-06-01T20:00:13.000Z");
  });

  it("calculates question 2 window after question 1 + 3s reveal", () => {
    const window = getQuestionWindow(startedAt, 2);
    // Q1 starts at +3s, lasts 10s, reveal 3s = Q2 starts at +16s
    expect(window.start.toISOString()).toBe("2026-06-01T20:00:16.000Z");
    expect(window.end.toISOString()).toBe("2026-06-01T20:00:26.000Z");
  });

  it("calculates question 10 window correctly", () => {
    const window = getQuestionWindow(startedAt, 10);
    // Q10 starts at: 3 + (10-1) * 13 = 3 + 117 = 120s
    expect(window.start.toISOString()).toBe("2026-06-01T20:02:00.000Z");
    expect(window.end.toISOString()).toBe("2026-06-01T20:02:10.000Z");
  });
});

describe("isAnswerInTime", () => {
  const startedAt = new Date("2026-06-01T20:00:00.000Z");

  it("accepts answer within 10 seconds", () => {
    const answeredAt = new Date("2026-06-01T20:00:08.000Z"); // 5s into Q1
    expect(isAnswerInTime(startedAt, 1, answeredAt)).toBe(true);
  });

  it("accepts answer within 1-second grace period", () => {
    const answeredAt = new Date("2026-06-01T20:00:13.500Z"); // 10.5s into Q1
    expect(isAnswerInTime(startedAt, 1, answeredAt)).toBe(true);
  });

  it("rejects answer after grace period", () => {
    const answeredAt = new Date("2026-06-01T20:00:14.500Z"); // 11.5s into Q1
    expect(isAnswerInTime(startedAt, 1, answeredAt)).toBe(false);
  });

  it("rejects answer before question starts", () => {
    const answeredAt = new Date("2026-06-01T20:00:02.000Z"); // before Q1 starts
    expect(isAnswerInTime(startedAt, 1, answeredAt)).toBe(false);
  });
});
