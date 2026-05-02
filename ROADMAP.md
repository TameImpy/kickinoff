# Kickin' Off — Roadmap Features

## Gamification & Badges

### Achievement Badges
- **Hat-Trick Hero** — Win 3 fixtures in a row within a league
- **Flawless Round** — Answer all 5 of your questions correctly in a single fixture (5/5)
- **Clean Sheet** — Win a fixture without your opponent getting a single question right (5-0)
- **Giant Killer** — Beat the league leader
- **Comeback King** — Win a fixture after being 2+ questions behind
- **The Streak** — Win 5 fixtures in a row across any leagues
- **Century Club** — Play 100 fixtures lifetime
- **Trophy Cabinet** — Win 3 different leagues
- **Last Gasp** — Answer the final question correctly to win a fixture by 1 point
- **The Wall** — Your opponents average less than 2 correct answers against you across a full league

### Seasonal Badges (World Cup 2026)
- **Group Stage Survivor** — Complete all fixtures in a league during the World Cup group stage
- **Golden Boot** — Highest total questions correct across all leagues in a calendar month
- **World Cup Winner** — Win a league in World Cup 2026 question mode

### Display
- Badges shown on profile page with earned date
- Locked badges shown greyed out with criteria visible (gives players goals to chase)
- Badge count displayed next to player name in league tables

---

## Question Quality & Variety

### Core Prompt Improvements
The current prompt produces functional questions but rounds can feel repetitive — too many "Who won the X World Cup?" or "Which club did Y play for?" patterns. The prompt needs to enforce structural variety, not just topic variety.

**Structural variety rules to add:**
- No two questions in a set should use the same question format (e.g. max 1 "Who...", max 1 "Which country...", max 1 "In what year...")
- Include at least 2 questions that aren't about identifying a person/team/country — e.g. "What was unusual about the 1950 World Cup final?", "Which of these stadiums has the largest capacity?"
- At least 1 question should be about a rule, tactic, or format rather than a factual recall
- At least 1 question should reference a specific match or moment, not a general stat
- Avoid questions where all 4 options are from the same category (e.g. 4 country names) — mix option types where possible

**Difficulty calibration:**
- Easy questions should be answerable by someone who casually watches football — iconic moments, famous players, host nations
- Medium questions should require active football interest — transfers, managers, specific seasons
- Hard questions should challenge dedicated fans — obscure records, historical oddities, tactical details
- Never ask questions that require specialist/niche knowledge that even dedicated fans wouldn't know

**Anti-staleness measures:**
- Track question categories used per league and pass category distribution to the prompt — if the last 3 fixtures have been heavy on "transfers", the next should skew away
- Introduce thematic mini-rounds: occasionally cluster 2-3 questions around a theme within the 10 ("This round features a World Cup 1998 mini-round")
- Add "picture round" style questions describing a scenario ("A player scored a hat-trick in a World Cup final. He played for a European club at the time. Who was he?") rather than direct recall

---

## Features Worth Building

### High Impact, Low Effort

**Fixture rematch request**
After a league completes, allow players to challenge any opponent to a one-off friendly fixture (no league points). Keeps the app sticky between leagues without needing to create a whole new league. Two taps: "Rematch {name}" → opponent gets a notification → play.

**League invite deep link preview**
When someone shares a link on WhatsApp/iMessage, show a rich preview (OG image) with the league name, player count, and a branded card. Currently it's just a plain URL. This is purely an OG meta tag and image generation task — high viral impact for minimal work.

**"Play again" prompt after league completion**
When a league finishes, prompt all members: "Start a new season?" If the creator taps yes, a new league is created with the same members, question mode, and settings. One tap to restart instead of recreating from scratch.

### High Impact, Medium Effort

**League chat / banter feed**
A simple text feed within each league — not a full chat system, more like a match-day thread. Auto-posts fixture results ("Matt beat James 4-1"), allows short text reactions. This is where the social dynamic lives between fixtures. The video call is the peak moment, but the banter between matches is what keeps people coming back.

**Spectator mode**
Let league members watch a fixture in progress (read-only view of the quiz + video). This would be huge for engagement — imagine 6 people in a league all watching the title-deciding fixture. Implementation: same Realtime channel, additional LiveKit subscribers with canPublish: false.

**Weekly digest email**
Automated weekly email to all active league members: standings update, upcoming fixtures, stats highlights ("Matt has the best correct % this week at 78%"). Drives re-engagement for people who forget to open the app. Uses Resend + a Vercel cron job.

### High Impact, High Effort

**Async mode (V2)**
We explicitly decided against this for MVP — the live video call IS the product. But post-launch, if fixture completion rates are below 60%, async mode becomes necessary. Both players answer the same 10 questions independently within the deadline window. No video. Scores compared afterward. This is the fallback if the scheduling friction proves too high. Only introduce if data demands it.

**Tournament mode**
Single-elimination bracket tournament alongside the round-robin league. 8 players, 3 rounds, winner takes all. Different energy to a league — higher stakes, one-and-done. Good for one-off events (World Cup final night, Christmas, etc.). Requires a new fixture generation algorithm (bracket) and a bracket visualisation UI.

**Voice commentary on answer reveals**
Instead of just showing green/red on the answer reveal, play a short AI-generated voice line: "Correct! That was a tricky one" or "Unlucky — it was actually Brazil." Generated per-question via TTS. Makes the solo experience feel more like a TV quiz show. Cost: ~$0.002 per question via OpenAI TTS.

### Retention & Growth

**Referral tracking**
Track which invite links lead to sign-ups and fixture completions. Surface this to users: "You've invited 4 players who've played 12 fixtures." Gamify it with a badge ("Recruiter — invited 5 active players"). This data also tells you who your super-spreaders are.

**Seasonal leaderboard**
Global leaderboard across all leagues, reset monthly. "Top players this month" ranked by win rate (minimum 5 fixtures played). Gives competitive players something to chase beyond their friend group. Opt-in to avoid privacy concerns.

**Question submission**
Let users submit their own questions (moderated). "Think you've got a question that'll stump everyone? Submit it." If approved (by LLM review for accuracy + quality), it enters the question pool. Credits the submitter. Builds community ownership and solves the question variety problem at scale.
