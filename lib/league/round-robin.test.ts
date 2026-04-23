import { describe, it, expect } from "vitest";
import { generateFixtures } from "./round-robin";

describe("generateFixtures", () => {
  const startDate = new Date("2026-06-01T00:00:00Z");

  it("generates correct number of rounds and fixtures for 4 players", () => {
    const players = ["p1", "p2", "p3", "p4"];
    const fixtures = generateFixtures(players, "league1", startDate, 7);

    // 4 players = 3 rounds, 2 fixtures per round = 6 total
    const rounds = new Set(fixtures.map((f) => f.round));
    expect(rounds.size).toBe(3);
    expect(fixtures.length).toBe(6);
  });

  it("ensures every player plays every other player exactly once", () => {
    const players = ["p1", "p2", "p3", "p4", "p5", "p6"];
    const fixtures = generateFixtures(players, "league1", startDate, 7);

    // Each pair should appear exactly once
    const matchups = new Set(
      fixtures.map((f) => [f.homeUserId, f.awayUserId].sort().join("-"))
    );
    // 6 players = 15 unique pairs (6 choose 2)
    expect(matchups.size).toBe(15);
    expect(fixtures.length).toBe(15);
  });

  it("handles odd number of players with byes", () => {
    const players = ["p1", "p2", "p3", "p4", "p5"];
    const fixtures = generateFixtures(players, "league1", startDate, 7);

    // 5 players: 5 rounds (padded to 6 for circle method, so 5 rounds)
    // Each round has 2 fixtures (one player gets bye)
    // Total fixtures = 10 (5 choose 2)
    expect(fixtures.length).toBe(10);

    // No fixture should contain "BYE"
    for (const f of fixtures) {
      expect(f.homeUserId).not.toBe("BYE");
      expect(f.awayUserId).not.toBe("BYE");
    }

    // Every pair plays exactly once
    const matchups = new Set(
      fixtures.map((f) => [f.homeUserId, f.awayUserId].sort().join("-"))
    );
    expect(matchups.size).toBe(10);
  });

  it("sets correct deadlines based on round and window days", () => {
    const players = ["p1", "p2", "p3", "p4"];
    const fixtures = generateFixtures(players, "league1", startDate, 7);

    const round1 = fixtures.filter((f) => f.round === 1);
    const round2 = fixtures.filter((f) => f.round === 2);
    const round3 = fixtures.filter((f) => f.round === 3);

    // Round 1 deadline: start + 7 days
    expect(round1[0].deadline.toISOString()).toBe("2026-06-08T00:00:00.000Z");
    // Round 2 deadline: start + 14 days
    expect(round2[0].deadline.toISOString()).toBe("2026-06-15T00:00:00.000Z");
    // Round 3 deadline: start + 21 days
    expect(round3[0].deadline.toISOString()).toBe("2026-06-22T00:00:00.000Z");
  });

  it("works with minimum 3 players", () => {
    const players = ["p1", "p2", "p3"];
    const fixtures = generateFixtures(players, "league1", startDate, 7);

    // 3 players = 3 fixtures (3 choose 2)
    expect(fixtures.length).toBe(3);

    const matchups = new Set(
      fixtures.map((f) => [f.homeUserId, f.awayUserId].sort().join("-"))
    );
    expect(matchups.size).toBe(3);
  });
});
