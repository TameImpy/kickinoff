import { describe, it, expect } from "vitest";
import { calculateFixtureResult, sortLeagueTable } from "./scoring";

describe("calculateFixtureResult", () => {
  it("awards 3 points to the winner and 0 to the loser", () => {
    const result = calculateFixtureResult(4, 2);
    expect(result).toEqual({
      homePoints: 3,
      awayPoints: 0,
      homeResult: "win",
      awayResult: "loss",
    });
  });

  it("awards 1 point each for a draw", () => {
    const result = calculateFixtureResult(3, 3);
    expect(result).toEqual({
      homePoints: 1,
      awayPoints: 1,
      homeResult: "draw",
      awayResult: "draw",
    });
  });

  it("awards 3 points to away when away wins", () => {
    const result = calculateFixtureResult(1, 5);
    expect(result).toEqual({
      homePoints: 0,
      awayPoints: 3,
      homeResult: "loss",
      awayResult: "win",
    });
  });
});

describe("sortLeagueTable", () => {
  const makeMember = (
    userId: string,
    displayName: string,
    overrides: Partial<LeagueMember> = {}
  ): LeagueMember => ({
    userId,
    displayName,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    questionsCorrect: 0,
    questionsTotal: 0,
    ...overrides,
  });

  it("sorts by points descending", () => {
    const members = [
      makeMember("a", "Alice", { points: 3 }),
      makeMember("b", "Bob", { points: 9 }),
      makeMember("c", "Charlie", { points: 6 }),
    ];
    const sorted = sortLeagueTable(members, []);
    expect(sorted.map((m) => m.userId)).toEqual(["b", "c", "a"]);
  });

  it("breaks points tie with question difference", () => {
    const members = [
      makeMember("a", "Alice", { points: 6, questionsCorrect: 10, questionsTotal: 20 }),
      makeMember("b", "Bob", { points: 6, questionsCorrect: 14, questionsTotal: 20 }),
    ];
    const sorted = sortLeagueTable(members, []);
    // Bob: QD = 14 - 6 = +8, Alice: QD = 10 - 10 = 0
    expect(sorted.map((m) => m.userId)).toEqual(["b", "a"]);
  });

  it("breaks QD tie with questions correct (for)", () => {
    const members = [
      makeMember("a", "Alice", { points: 6, questionsCorrect: 12, questionsTotal: 20 }),
      makeMember("b", "Bob", { points: 6, questionsCorrect: 14, questionsTotal: 22 }),
    ];
    // Alice QD: 12 - 8 = +4, Bob QD: 14 - 8 = +6... wait
    // Actually: Alice QD = 12 - (20-12) = 12-8 = 4. Bob QD = 14 - (22-14) = 14-8 = 6
    // QD different, so Bob wins on QD. Let me fix to make QD equal.
    const membersFixed = [
      makeMember("a", "Alice", { points: 6, questionsCorrect: 10, questionsTotal: 16 }),
      makeMember("b", "Bob", { points: 6, questionsCorrect: 12, questionsTotal: 18 }),
    ];
    // Alice QD: 10-6 = 4, Bob QD: 12-6 = 6 ... still different
    // QD = correct - (total - correct) = 2*correct - total
    // Need 2*10-16 = 4, 2*12-18 = 6, still not equal
    // Let's do: Alice 10/16 (QD=4), Bob 12/20 (QD=4). Same QD, Bob has more QF
    const members2 = [
      makeMember("a", "Alice", { points: 6, questionsCorrect: 10, questionsTotal: 16 }),
      makeMember("b", "Bob", { points: 6, questionsCorrect: 12, questionsTotal: 20 }),
    ];
    const sorted = sortLeagueTable(members2, []);
    expect(sorted.map((m) => m.userId)).toEqual(["b", "a"]);
  });

  it("breaks full tie with head-to-head result", () => {
    const members = [
      makeMember("a", "Alice", { points: 6, questionsCorrect: 10, questionsTotal: 16 }),
      makeMember("b", "Bob", { points: 6, questionsCorrect: 10, questionsTotal: 16 }),
    ];
    const fixtures = [
      { homeUserId: "a", awayUserId: "b", homeScore: 3, awayScore: 4 },
    ];
    const sorted = sortLeagueTable(members, fixtures);
    // Bob beat Alice in their H2H
    expect(sorted.map((m) => m.userId)).toEqual(["b", "a"]);
  });

  it("falls back to alphabetical when all else is equal", () => {
    const members = [
      makeMember("a", "Zara", { points: 6, questionsCorrect: 10, questionsTotal: 16 }),
      makeMember("b", "Alice", { points: 6, questionsCorrect: 10, questionsTotal: 16 }),
    ];
    const sorted = sortLeagueTable(members, []);
    expect(sorted.map((m) => m.userId)).toEqual(["b", "a"]);
  });
});
