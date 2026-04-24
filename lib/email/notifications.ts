import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = "Kickin' Off <noreply@kickinoff.co.uk>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kickinoff.co.uk";

export async function sendLeagueStarted(
  email: string,
  leagueName: string,
  leagueId: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `${leagueName} has kicked off!`,
    html: `
      <h2>Your league "${leagueName}" has started!</h2>
      <p>First fixtures are ready. Time to prove what you know.</p>
      <p><a href="${APP_URL}/league/${leagueId}">View your fixtures</a></p>
    `,
  });
}

export async function sendFixtureNudge(
  email: string,
  fromName: string,
  leagueName: string,
  fixtureUrl: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `${fromName} wants to play your fixture!`,
    html: `
      <h2>${fromName} is ready to play</h2>
      <p>Your fixture in "${leagueName}" is waiting. Don't keep them hanging.</p>
      <p><a href="${fixtureUrl}">Open Kickin' Off</a></p>
    `,
  });
}

export async function sendFixtureReminder(
  email: string,
  opponentName: string,
  leagueName: string,
  fixtureUrl: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `24 hours left to play your fixture`,
    html: `
      <h2>Fixture reminder</h2>
      <p>You have 24 hours left to play your fixture against ${opponentName} in "${leagueName}".</p>
      <p>If it expires, both players get 0 points.</p>
      <p><a href="${fixtureUrl}">Play now</a></p>
    `,
  });
}

export async function sendFixtureExpired(
  email: string,
  opponentName: string,
  leagueName: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Fixture expired — 0 points`,
    html: `
      <h2>Fixture expired</h2>
      <p>Your fixture against ${opponentName} in "${leagueName}" expired. 0 points for both players.</p>
    `,
  });
}

export async function sendRoundComplete(
  email: string,
  leagueName: string,
  round: number,
  position: number,
  leagueId: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Round ${round} complete in ${leagueName}`,
    html: `
      <h2>Round ${round} is done!</h2>
      <p>You're in position ${position} in "${leagueName}". Next round starts now.</p>
      <p><a href="${APP_URL}/league/${leagueId}">View the table</a></p>
    `,
  });
}

export async function sendLeagueComplete(
  email: string,
  leagueName: string,
  winnerName: string,
  leagueId: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `${leagueName} is over!`,
    html: `
      <h2>${leagueName} is finished!</h2>
      <p>${winnerName} wins the league!</p>
      <p><a href="${APP_URL}/league/${leagueId}">See the final table</a></p>
    `,
  });
}
