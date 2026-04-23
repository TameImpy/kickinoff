export type MatchResult = "win" | "loss" | "draw";

export interface FixtureResult {
  homePoints: number;
  awayPoints: number;
  homeResult: MatchResult;
  awayResult: MatchResult;
}

export interface LeagueMember {
  userId: string;
  displayName: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  questionsCorrect: number;
  questionsTotal: number;
}

export interface FixtureRecord {
  homeUserId: string;
  awayUserId: string;
  homeScore: number;
  awayScore: number;
}

export function calculateFixtureResult(
  homeScore: number,
  awayScore: number
): FixtureResult {
  if (homeScore > awayScore) {
    return { homePoints: 3, awayPoints: 0, homeResult: "win", awayResult: "loss" };
  }
  if (awayScore > homeScore) {
    return { homePoints: 0, awayPoints: 3, homeResult: "loss", awayResult: "win" };
  }
  return { homePoints: 1, awayPoints: 1, homeResult: "draw", awayResult: "draw" };
}

export function sortLeagueTable(
  members: LeagueMember[],
  fixtures: FixtureRecord[]
): LeagueMember[] {
  return [...members].sort((a, b) => {
    // 1. Points (desc)
    if (b.points !== a.points) return b.points - a.points;

    // 2. Question Difference (desc)
    const aQD = a.questionsCorrect - (a.questionsTotal - a.questionsCorrect);
    const bQD = b.questionsCorrect - (b.questionsTotal - b.questionsCorrect);
    if (bQD !== aQD) return bQD - aQD;

    // 3. Questions For (desc)
    if (b.questionsCorrect !== a.questionsCorrect)
      return b.questionsCorrect - a.questionsCorrect;

    // 4. Head-to-head
    const h2h = fixtures.find(
      (f) =>
        (f.homeUserId === a.userId && f.awayUserId === b.userId) ||
        (f.homeUserId === b.userId && f.awayUserId === a.userId)
    );
    if (h2h) {
      const aIsHome = h2h.homeUserId === a.userId;
      const aScore = aIsHome ? h2h.homeScore : h2h.awayScore;
      const bScore = aIsHome ? h2h.awayScore : h2h.homeScore;
      if (aScore !== bScore) return bScore - aScore; // higher score wins
    }

    // 5. Alphabetical
    return a.displayName.localeCompare(b.displayName);
  });
}
