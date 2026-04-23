export interface Fixture {
  leagueId: string;
  round: number;
  homeUserId: string;
  awayUserId: string;
  deadline: Date;
}

export function generateFixtures(
  playerIds: string[],
  leagueId: string,
  startDate: Date,
  windowDays: number
): Fixture[] {
  const players = [...playerIds];

  // If odd number of players, add a "BYE" placeholder
  if (players.length % 2 !== 0) {
    players.push("BYE");
  }

  const n = players.length;
  const rounds = n - 1;
  const fixtures: Fixture[] = [];

  // Circle method: fix player[0], rotate the rest
  for (let round = 0; round < rounds; round++) {
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + windowDays * (round + 1));

    const halfSize = n / 2;

    for (let i = 0; i < halfSize; i++) {
      const home = players[i];
      const away = players[n - 1 - i];

      // Skip fixtures involving the BYE placeholder
      if (home === "BYE" || away === "BYE") continue;

      fixtures.push({
        leagueId,
        round: round + 1,
        homeUserId: home,
        awayUserId: away,
        deadline,
      });
    }

    // Rotate: keep players[0] fixed, rotate the rest clockwise
    const last = players.pop()!;
    players.splice(1, 0, last);
  }

  return fixtures;
}
