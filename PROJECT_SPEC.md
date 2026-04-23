# Kickin' Off — Football Quiz App: Full Project Specification

## Project Overview

**Kickin' Off** is a progressive web app where friends compete in head-to-head football trivia leagues. Each "fixture" is played live via video call with AI-generated questions. Results feed into a league table using the standard 3pts/1pt/0pt system.

**Target launch:** Soft launch June 8, 2026. Full launch June 11 (World Cup opening day). Peak moment: June 17 (England vs Croatia, 9pm UK).

**Platform:** Progressive Web App (PWA) — mobile-first responsive, installable to homescreen. NOT native iOS/Android for MVP. Users access via `kickinoff.co.uk`. The PWA runs full-screen from the homescreen and is indistinguishable from a native app.

**Domain:** `kickinoff.co.uk`

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | **Next.js 14+ (App Router)** with React 18+ | PWA support, SSR for landing page, client-side app shell for authenticated experience |
| Styling | **Tailwind CSS** | Rapid UI development, mobile-first utilities |
| Auth | **Supabase Auth** (Google OAuth only) | One-tap sign-in, no context-switch. Covers ~95% of target audience |
| Database | **Supabase (PostgreSQL)** | Relational data model, row-level security |
| Realtime | **Supabase Realtime** | Fixture room synchronisation only (not used for league tables or fixture lists) |
| Video | **LiveKit Cloud** (JS SDK) | 1-on-1 WebRTC video rooms. Free tier: 5,000 participant-minutes/month |
| AI Questions | **Anthropic Claude API** (claude-sonnet-4-20250514) | On-demand football trivia generation with structured JSON output |
| Season Recap Audio | **OpenAI TTS API** | Narrated season recaps on league completion. ~$0.01 per league |
| Hosting | **Vercel** | Zero-config Next.js deployment, API routes, cron jobs, preview deployments |
| Server Logic | **Next.js API Routes** (on Vercel) | All server-side logic in one codebase, one runtime. No Supabase Edge Functions |
| Email Notifications | **Resend** (free tier) | Fixture reminders, league updates. 3,000 emails/month free |
| Analytics | **Supabase queries** | Direct DB queries for MVP metrics. No third-party analytics tooling |

### Removed from MVP (V1.1+)
- Push notifications (Web Push API) — email notifications used instead
- Image generation for league table sharing (Satori/html-to-image) — text share for MVP
- Posthog / Vercel Analytics — query Supabase directly
- Apple Sign-In / email magic link auth
- Larger league formats (10+ players, non-round-robin)

---

## Data Model

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Leagues
```sql
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL, -- 6-char alphanumeric, uppercase
  created_by UUID REFERENCES users(id) NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'active', 'completed')),
  -- 'open' = accepting players, 'active' = fixtures generated, 'completed' = all fixtures played
  max_players INT DEFAULT 6 CHECK (max_players >= 3 AND max_players <= 8),
  fixture_window_days INT DEFAULT 7, -- days allowed to play each round, adjustable mid-league
  question_mode TEXT DEFAULT 'general' CHECK (question_mode IN ('general', 'world_cup_2026', 'premier_league')),
  -- question_mode is fixed for the lifetime of the league
  current_round INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### League Members
```sql
CREATE TABLE league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  points INT DEFAULT 0,
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  drawn INT DEFAULT 0,
  lost INT DEFAULT 0,
  questions_correct INT DEFAULT 0,
  questions_total INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(league_id, user_id)
);
```

### Fixtures
```sql
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
  round INT NOT NULL, -- which round of the round-robin
  home_user_id UUID REFERENCES users(id) NOT NULL,
  away_user_id UUID REFERENCES users(id) NOT NULL,
  home_score INT, -- NULL until played
  away_score INT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')),
  started_at TIMESTAMPTZ, -- shared timestamp for timer synchronisation
  deadline TIMESTAMPTZ, -- when this fixture must be played by
  video_room_id TEXT, -- LiveKit room name
  played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Questions (cached generated questions)
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE NOT NULL,
  question_number INT NOT NULL, -- 1-10
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_answer INT NOT NULL, -- 0-3 index
  category TEXT, -- e.g. 'world_cup', 'transfers', 'records', 'premier_league'
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  answered_by_home BOOLEAN DEFAULT FALSE,
  home_answer INT, -- what home user answered (0-3 or NULL if timeout)
  home_correct BOOLEAN,
  answered_by_away BOOLEAN DEFAULT FALSE,
  away_answer INT,
  away_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Indexes
```sql
CREATE INDEX idx_fixtures_league ON fixtures(league_id, round);
CREATE INDEX idx_fixtures_users ON fixtures(home_user_id, away_user_id);
CREATE INDEX idx_league_members_league ON league_members(league_id);
CREATE INDEX idx_league_members_user ON league_members(user_id);
CREATE INDEX idx_questions_fixture ON questions(fixture_id, question_number);
```

---

## Core Features — Detailed Specifications

### 1. Authentication

**Flow:**
1. Landing page with "Get Started" CTA
2. "Sign in with Google" button (Google OAuth via Supabase Auth)
3. On first login, prompt for display_name (pre-fill from Google profile)
4. After auth, redirect to dashboard (league list)

**Requirements:**
- Supabase Auth handles session management
- JWT stored in httpOnly cookie for SSR pages
- Protected routes redirect to login
- Display name must be 2-20 characters, alphanumeric + spaces
- Google OAuth only for MVP — no magic link, no Apple Sign-In

### 2. League Creation & Joining

**Create League Flow:**
1. User taps "Create League" on dashboard
2. Form fields:
   - League name (required, 3-40 chars)
   - Question mode: General Football / World Cup 2026 / Premier League (fixed for lifetime of league)
   - Max players: 3-8 (default 6)
   - Round duration: 1 day / 3 days / 5 days / 7 days / 14 days (default 7) — adjustable mid-league by creator (takes effect from next round)
3. System generates a unique 6-character invite code (uppercase alphanumeric, check for uniqueness)
4. User is automatically added as first member
5. Show share screen with:
   - Invite code displayed prominently
   - "Share Link" button → copies `https://kickinoff.co.uk/join/{code}` to clipboard
   - "Share to WhatsApp" button → opens WhatsApp with pre-formatted message:
     ```
     I've created a football quiz league on Kickin' Off!

     Join "{league_name}" and prove you know more about football than me.

     https://kickinoff.co.uk/join/{code}
     ```

**Join League Flow:**
1. User opens invite link (`/join/{code}`) OR enters code manually on dashboard ("Have a code? Enter it here.")
2. If not logged in, auth flow first, then auto-join
3. Show league details: name, creator, current members, spots remaining
4. "Join League" button
5. If league is full (max_players reached), show error
6. After joining, show league lobby with member list

**Start League (Lock & Generate Fixtures):**
1. League creator can "Start League" once 3+ members have joined
2. This sets status to 'active' and generates the full round-robin fixture schedule
3. No more members can join after this point
4. All members receive an email: "Your league '{name}' has kicked off! First fixtures are ready."
5. Full fixture schedule for all rounds is visible to all players immediately

**Round-Robin Algorithm:**
- For N players, generate N-1 rounds using the circle method
- Each round has floor(N/2) fixtures
- If N is odd, one player has a bye each round — byes are skips (0 points, no score, doesn't count as played). Everyone gets the same number of byes so it's inherently fair
- Calculate deadline for each round: round_start + fixture_window_days
- Round 1 starts immediately when league is locked

**Round Advancement:**
- Auto-advance immediately: as soon as all fixtures in round N are completed or expired, round N+1 deadlines begin
- No manual intervention needed from the creator
- The deadline is a maximum, not a fixed schedule — fast leagues finish faster

**Leaving Leagues:**
- Players can leave a league ONLY before it starts (status = 'open')
- Once a league is active, players cannot leave — they're committed
- If a player stops playing, their fixtures expire naturally (0 points both)

**Rematches:**
- No rematches. The result stands. One fixture per matchup per league

**League Settings (Mid-League):**
- Only round duration is editable mid-league (by the creator, takes effect from next round)
- League name, question mode, max players are all locked at creation

**League Creator Privileges:**
- Only the creator can tap "Start League"
- No fallback mechanism if the creator goes AWOL — this is a mates-based app, you text them

### 3. Fixture Play (The Core Loop)

This is the most critical and complex feature. It combines video calling with a synchronized quiz experience. The live video call is a core USP — there is no async fallback mode.

**Pre-Fixture Flow:**
1. User sees their pending fixtures on league page (full schedule visible for all rounds)
2. Each fixture shows: opponent name, deadline, "Nudge" button, "Play" button
3. **Nudge:** Sends a push notification + in-app notification to opponent with deep link to fixture page: "{name} wants to play your fixture! Tap to join." (Assumes players coordinate timing on WhatsApp, nudge is the "I'm in the app now" signal)
4. **Play:** When a player taps "Play", the video room is created and they enter WAITING state. Opponent gets a notification: "{name} is waiting for you!"
5. Questions are pre-generated via Claude API when the first player enters the room (during WAITING state), so they're ready before the match starts

**Fixture Room (Video + Quiz):**

**Layout:** Video feeds take the top half of the screen, quiz UI takes the bottom half. Consistent layout throughout — no resizing or rearranging during play.

State machine for fixture:
```
WAITING → READY → COUNTDOWN → QUESTION_ACTIVE → ANSWER_REVEAL → (repeat for 10 questions) → RESULT
```

**WAITING state:**
- First user to arrive sees their own video feed + "Waiting for {opponent}..."
- LiveKit room is created with a unique room name (fixture ID)
- Questions are being generated in the background (Claude API call)
- No timeout — player leaves when they want. LiveKit room cleans up 5 minutes after last participant leaves
- When second user joins, both video feeds are visible
- "Both Ready? Start Match" button appears for BOTH players — both must tap to confirm
- Each player's button shows their ready state. Both players can see: "{Name} is ready" or "Waiting for {Name}..."
- When both are ready, the 3-second countdown starts automatically

**READY state:**
- Both users confirmed present
- 3-second countdown ("3... 2... 1... Kickin' Off!")
- API route records a `started_at` timestamp on the fixture — this is the single source of truth for all timing
- Both clients derive all question timing from this timestamp
- Video feeds remain visible throughout

**QUESTION_ACTIVE state (repeats 10 times):**
- Question appears in bottom half of screen below video feeds
- Question text + 4 answer options (A/B/C/D)
- 10-second countdown timer (prominent, animated)
- Questions alternate: odd questions (1,3,5,7,9) are for the home user, even questions (2,4,6,8,10) are for the away user
- IMPORTANT: Both users SEE every question, but only the active player can answer. The non-active player sees the question and options as plain text (not tappable buttons) with a "{Name}'s turn" label at the top. The other player watches their opponent think (this is where the video social dynamic shines — you can see them sweating)
- This alternating format is a deliberate accessibility choice: it means a casual fan can compete with an expert through the variance of only answering 5 questions each
- Active player taps their answer → locks in, button greys out
- If timer expires without answer → treated as incorrect
- Client shows 10-second timer. Server accepts answers up to 11 seconds (hidden 1-second grace period to absorb network latency)

**Timer Synchronisation:**
- All timing derives from the `started_at` timestamp recorded by the server
- Both clients calculate question windows locally from this shared timestamp
- Question N starts at: `started_at + 3s (countdown) + (N-1) * (10s question + 3s reveal)`
- No back-and-forth negotiation needed between clients

**ANSWER_REVEAL state:**
- Show correct answer highlighted in green
- Show what the player answered (green tick or red cross)
- Update running score: "Matt 3 - 2 James"
- 3-second pause before next question
- Brief animation/sound for correct/incorrect

**Sound Design:**
- Subtle sounds that sit under conversation volume — never competing with the live video audio
- Last 3 seconds of countdown: quiet ticks
- Correct answer: short bright chime
- Incorrect answer: gentle buzz
- Final result: whistle
- Haptic feedback (navigator.vibrate) on answer selection
- Mute-sounds toggle available in settings

**RESULT state:**
- Final score displayed: "Matt 3 - 2 James"
- "Matt wins! 3 points to Matt in {league_name}"
- Or "It's a draw! 1 point each"
- Update league_members table: points, played, won/drawn/lost, questions_correct/total
- Update fixture: status='completed', scores, played_at
- **Share button (win/draw only):** tailored message based on result
  - Win: "Just beat {opponent} {score} on Kickin' Off! Get involved: kickinoff.co.uk/join/{code}"
  - Draw: "{score} draw with {opponent} on Kickin' Off. Couldn't separate us. kickinoff.co.uk/join/{code}"
  - Loss: no share prompt (share button hidden or subtle — nobody wants to broadcast an L)
- "Back to League" button
- Video call ends automatically after 15 seconds or when both leave

**Edge Cases:**
- **Player disconnects mid-fixture:** 60-second reconnection window. Opponent sees countdown: "Waiting for {name} to reconnect... (0:58)". If a question timer is running during disconnection, it keeps running (missed answer = incorrect). If they don't reconnect within 60 seconds, fixture is forfeited — opponent gets 5-0 win.
- **Both users disconnect:** fixture returns to 'pending' status
- **Camera permission denied:** allow audio-only with a static avatar, but show a warning that video is recommended
- **Poor connection:** LiveKit handles adaptive bitrate. If video quality is too low, degrade to audio + static images
- **Tab/app switch during question:** no anti-cheat mechanism needed. The 10-second timer makes it practically impossible to Google an answer on mobile. The timer IS the anti-cheat

**Expired Fixtures:**
- Fixtures not played by the deadline are marked 'expired'
- Both players receive 0 points (0-0 loss for both, not a draw)
- This incentivises actually scheduling and playing fixtures
- Daily cron job (via Vercel cron) checks for and expires overdue fixtures

**Real-time Synchronisation:**
- Supabase Realtime is used ONLY inside the fixture room during active play
- One Realtime channel per active fixture, subscribed to only while both players are in the room
- League tables, fixture lists, and all other data are fetched on demand (page load / pull-to-refresh)
- Answer submissions go through Next.js API routes which validate timing and record answers
- The API route broadcasts the result via the Realtime channel, triggering the answer reveal on both clients
- Server-side validation prevents client-side cheating

**Server-Authoritative Model:**
- The client NEVER directly queries the questions table
- All question data flows through API routes
- `get-current-question` returns only question text and options — never the correct answer
- `submit-answer` validates and returns the result including the correct answer
- The client is a dumb display; the server controls the flow

### 4. AI Question Generation

**System prompt for Claude API:**
```
You are a football trivia question generator. Generate exactly 10 multiple-choice questions for a football quiz. Each question must have exactly 4 answer options with one correct answer.

Rules:
- Questions must be factual and verifiable
- Mix difficulty: 3 easy, 4 medium, 3 hard
- Mix categories: transfers, records, World Cup history, Premier League, international football, managers, stadiums, current season
- Never repeat questions from the provided "previously used" list
- All facts must be accurate as of June 2026
- Avoid ambiguous questions where multiple answers could be correct
- Keep question text concise (under 120 characters)
- Keep answer options concise (under 40 characters each)

{IF question_mode == 'world_cup_2026'}
Focus 70% of questions on World Cup 2026 topics: groups, squads, host cities, World Cup history, qualifying, previous tournaments. Remaining 30% general football.
{ENDIF}

{IF question_mode == 'premier_league'}
Focus 70% of questions on Premier League: current season 2025-26, all-time records, historical seasons, clubs, managers. Remaining 30% general football.
{ENDIF}

Respond with ONLY valid JSON, no markdown formatting, no preamble:
{
  "questions": [
    {
      "question": "Which country hosted the 2014 World Cup?",
      "options": ["Brazil", "Germany", "South Africa", "Russia"],
      "correct_answer": 0,
      "category": "world_cup",
      "difficulty": "easy"
    }
  ]
}
```

**Implementation:**
1. Questions are pre-generated when the first player enters the fixture room (WAITING state) — this gives a 30-60 second head start while waiting for the opponent
2. Parse JSON response, validate structure (10 questions, each with 4 options, correct_answer 0-3)
3. Store in questions table linked to fixture_id
4. If API call fails, retry once. If still fails, fall back to a cached question set (pre-generate 20 sets at app startup and store them)
5. Cache question sets per fixture — never regenerate for the same fixture
6. In 99% of cases, questions are ready before the match starts. If not, show a brief "Generating questions..." state

**Question Deduplication:**
- Maintain a per-league "used questions" hash set
- Pass the last 50 used question texts to the API prompt as exclusions
- This prevents the same questions appearing across fixtures in the same league

**Cost Estimation:**
- ~10 questions = ~800 input tokens + ~1,500 output tokens per fixture
- At Claude Sonnet pricing: approximately $0.005 per fixture
- 1,000 fixtures/month = ~$5/month in API costs

### 5. League Completion Ceremony

When all fixtures in all rounds are completed or expired, the league status changes to 'completed' and triggers the ceremony.

**Winner Celebration Screen:**
- One-time splash overlay when a player first opens a completed league
- Winner's name displayed big and bold
- Final league table
- Confetti animation
- "Share Result" button

**AI Season Recap (Narrated):**
- On league completion, an API route queries all fixture results and calculates round-by-round standings progression
- Passes structured data to Claude API with prompt: "Write a 150-word dramatic season recap in the style of a Sky Sports end-of-season montage narration. Mention key moments, upsets, streaks, and the title race."
- The text recap is then sent to OpenAI TTS API to generate an audio narration
- Both text and audio are cached — generated once per league
- Audio plays automatically over the celebration screen
- Pre-generated when the final fixture completes (not on-demand when user opens the page)
- Cost: ~$0.005 (Claude) + ~$0.01 (OpenAI TTS) per league = negligible

### 6. League Table

**Display:**
- Sorted by: Points (desc) → Question Difference (desc) → Questions For (desc) → Head-to-head result → Alphabetical by display name
- Columns: Position, Player Name, P (played), W, D, L, QF (questions for), QA (questions against), QD (question difference), Pts
- Highlight current user's row
- Show current round indicator: "Round 3 of 5"
- Show fixtures for all rounds with status (pending/completed/expired)

**Share (MVP — text only):**
- "Share League Table" button
- Pre-formatted text message with standings and invite link:
  ```
  Kickin' Off League: Matt's World Cup League

  1. James - 9pts
  2. Matt - 7pts
  3. Dave - 4pts

  Join: kickinoff.co.uk/join/ABC123
  ```
- Share via Web Share API (opens native share sheet on mobile) or copy to clipboard

**Share as Image (V1.1):**
- Generate branded images (1080x1920 for Stories, 1080x1080 for posts) using Satori or html-to-image

### 7. Dashboard / Home Screen

**Authenticated Home:**
- Greeting: "Hey Matt" (display name)
- Active leagues list (cards showing: league name, your position, next fixture, round progress)
- "Create League" FAB or prominent button
- "Join League" option (manual code entry: "Have a code? Enter it here.")
- If no leagues yet: empty state with clear CTA and illustration

**League Detail Page:**
- League table (always visible at top)
- Fixtures tab: all rounds with status (pending/completed/expired) — full schedule visible
- History tab: past round results
- Members list
- League settings (creator only): invite code, share link, adjust round duration
- "Leave League" option (only before league starts)

### 8. Email Notifications (via Resend)

Push notifications are deferred to V1.1. MVP uses email for key lifecycle events.

**Notification types:**
1. **League started:** "Your league '{name}' has kicked off! First fixtures are ready."
2. **Fixture nudge:** "{name} wants to play your fixture! Open Kickin' Off to join."
3. **Fixture reminder:** "You have 24 hours left to play your fixture against {name} in '{league}'."
4. **Fixture expired:** "Your fixture against {name} expired. 0 points for both players."
5. **Round complete:** "Round {n} is complete! You're {position} in '{league}'. Next round starts now."
6. **League complete:** "'{league}' is over! {winner} wins the league!"

**Implementation:**
- Resend API (free tier: 3,000 emails/month)
- Triggered from Next.js API routes after relevant events
- Simple, clean email templates matching Kickin' Off branding

### 9. PWA Configuration

**manifest.json:**
```json
{
  "name": "Kickin' Off - Football Quiz Leagues",
  "short_name": "Kickin' Off",
  "description": "Head-to-head football trivia with your mates",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0c0f14",
  "theme_color": "#00e676",
  // Note: background matches OLED-optimised dark base from Stitch design
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service Worker:**
- Minimal — just enough to enable PWA installability and show a simple offline fallback page
- No complex caching strategies
- No push notification handling (deferred to V1.1)

### 10. Landing Page (Unauthenticated)

**Purpose:** Convert visitors to sign-ups. This is where invite links and organic traffic land.

**Sections:**
1. Hero: compelling headline + demo video or animated mockup + "Get Started" CTA
2. How it works: 3-step visual (Create League → Play Fixtures on Video → Win the League)
3. Features: AI questions, video call format, league tables, World Cup mode
4. Social proof: (post-launch) user count, fixtures played, testimonials
5. Footer: CTA repeat, links

**If arriving via invite link (`/join/{code}`):**
- Show league name, creator, member count
- "Join This League" CTA → auth → auto-join
- Skip generic landing page content

### 11. Profile Page

**MVP Profile:**
- Display name and avatar (from Google OAuth)
- Basic stats: total played, W/D/L record, questions correct %, best score
- Logout button

**V1.1 Profile (Gamification):**
- Badges and achievements
- All-time stats and records
- Head-to-head records against specific opponents
- Streaks, milestones, and leaderboards
- Football fans love stats — this is a key engagement and retention surface

---

## API Routes (Next.js on Vercel)

All server-side logic lives in Next.js API routes. No Supabase Edge Functions.

1. **`POST /api/fixtures/[fixtureId]/generate-questions`**
   - Called when first player enters fixture room (WAITING state)
   - Input: `{ fixture_id, question_mode, exclude_questions: string[] }`
   - Calls Claude API, validates response, stores in questions table
   - Returns: `{ ready: true }` (questions are stored, not sent to client)

2. **`GET /api/fixtures/[fixtureId]/question/[number]`**
   - Returns question text and options ONLY — never the correct answer
   - Validates that the requesting user is a participant and the question is current

3. **`POST /api/fixtures/[fixtureId]/submit-answer`**
   - Input: `{ question_number, answer: 0-3 }`
   - Validates: user is participant, user is the active answerer for this question, within time window (10s + 1s grace)
   - Records answer, determines correctness
   - Broadcasts result via Supabase Realtime channel
   - Returns: `{ correct: boolean, correct_answer: number }`
   - Rate limited: max 1 submission per question per user

4. **`POST /api/fixtures/[fixtureId]/complete`**
   - Called after question 10's answer is revealed
   - Calculates final scores, updates fixture status
   - Updates league_members table (points, W/D/L, question stats)
   - Checks if round is complete → if so, advances to next round
   - Triggers email notifications via Resend

5. **`POST /api/fixtures/[fixtureId]/create-room`**
   - Called when a player taps "Play"
   - Creates LiveKit room, generates participant token
   - Returns: `{ room_name, token }`

6. **`POST /api/fixtures/[fixtureId]/nudge`**
   - Sends email notification to opponent with deep link to fixture page
   - Rate limited: max 1 nudge per fixture per hour

7. **`POST /api/fixtures/[fixtureId]/start`**
   - Called when both players confirm ready
   - Records `started_at` timestamp (single source of truth for all timing)
   - Returns: `{ started_at }`

8. **`GET /api/cron/expire-fixtures`** (Vercel cron, runs daily)
   - Finds fixtures past deadline that are still 'pending'
   - Marks as 'expired', records 0-0 (0 points for both)
   - Sends email notifications to both users
   - Checks if round is complete after expiring fixtures

---

## Design Approach

**All screens are designed in Google Stitch.** A single Stitch design covering all screens will be provided, exported as a design spec / HTML. This is the single source of truth for the visual design of the entire app — landing page and all authenticated screens. The implementation must closely match the Stitch design output.

**Build order:** Design first, then build. No UI work begins until the Stitch design is provided. Non-UI work (Supabase setup, API routes, auth config, algorithms, etc.) can proceed in parallel while the design is being created.

---

## UI/UX Design Guidelines

### Design Source
All UI is built from the Google Stitch design export (`design/stitch-reference.html` and `design/DESIGN.md`). The Stitch design is the single source of truth for component patterns, layout structure, and visual language. Colour palette is adapted for the Kickin' Off football brand as described below.

### Visual Identity
- **Style:** Cyber-Brutalism / High-Contrast Bold — aggressive, high-energy, competitive. The UI should feel like a gaming HUD
- **Dark OLED base:** Background #0D0D0D, Surface #131313, Cards #1A1A1A, Borders #262626
- **Primary color:** Electric green (#00e676) — evokes the pitch. Used for primary actions, CTAs, success states, correct answers
- **Accent:** Electric purple (#BD00FF) — used for branding accents, active states, secondary highlights
- **Tertiary:** Cyber cyan (#00dbe9) — used for info callouts, secondary interactive elements
- **Error:** Red (#ff5252 / #ffb4ab)
- **Typography:**
  - **Space Grotesk** — headlines, labels, scores, timers. Tight tracking, uppercase for aggression
  - **Spline Sans** — body copy, multi-line text. High readability during fast-paced play
- **Shapes:** Sharp (0px border radius). Clipped/chamfered corners (45-degree) on primary buttons. No curves. All elements strictly rectangular
- **Elevation:** Tonal layers + hard neon glows (no soft shadows, no frosted glass). Interactive elements use "Neon Underglow" in primary/accent colour
- **Tone:** Confident, slightly cheeky, football-literate. Not corporate. Think "your mate who runs the pub quiz" not "FIFA official communications"

### Component Patterns (from Stitch)
- **Primary buttons:** Solid green (#00e676) with black text, clipped top-right corner (`button-clip` polygon)
- **Secondary buttons:** 2px purple (#BD00FF) border, no fill, clipped corner
- **Cards:** #1A1A1A background, 1px #262626 border, hover border changes to accent colour
- **Leaderboard/League table:** Top positions highlighted with coloured left-stripe (neon glow)
- **Timer bar:** Full-width 4px bar, depletes right-to-left in green, turns purple when <5 seconds
- **Chips/badges:** Rectangular tags with cyan outline, Space Grotesk bold
- **Inputs:** Flat #1A1A1A with bottom-only 2px green border (command-line aesthetic)

### Mobile-First Layout
- Max content width: 480px (phone-optimised)
- 4-column grid with 20px outer margins on mobile
- Bottom navigation bar: Home / Leagues / Profile
- Large tap targets (min 44px)
- Haptic feedback on answer selection (navigator.vibrate)
- Spacing: 4px baseline grid (xs: 8px, sm: 16px, md: 24px, lg: 32px, xl: 48px)

### Fixture Room Layout
- **Top half:** Two video feeds side-by-side (or stacked in portrait)
- **Bottom half:** Quiz UI — question text, 4 answer buttons, timer, running score
- Layout is consistent throughout the fixture — no resizing or rearranging between states
- Mute/camera toggle controls (small, unobtrusive) overlaid on video

### Key Screens (in priority order):
1. Landing page (unauthenticated) — built from design tool output
2. Dashboard / Home (authenticated)
3. League detail (table + fixtures)
4. Fixture room (video + quiz — most complex screen)
5. Create league form
6. Join league screen
7. Post-fixture result screen
8. Profile page

---

## Security & Row-Level Security (RLS)

### Supabase RLS Policies:

```sql
-- Users can only read/update their own profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- League members can view their leagues
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view their leagues" ON leagues FOR SELECT
  USING (id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated users can create leagues" ON leagues FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- League members can view league membership
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view league members" ON league_members FOR SELECT
  USING (league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid()));

-- Fixtures visible to league members
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view fixtures" ON fixtures FOR SELECT
  USING (league_id IN (SELECT league_id FROM league_members WHERE user_id = auth.uid()));

-- Questions: clients do NOT query this table directly
-- All question access goes through API routes using the service role key
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
-- No client-facing SELECT policy — questions are served exclusively via API routes
```

### Answer Validation:
- ALL answer validation happens server-side in API routes
- Client never receives correct answers until after the player has answered or the timer expires
- Timestamp validation: answer must be submitted within 11 seconds of question start (10s visible timer + 1s hidden grace period)
- Rate limiting on submit-answer: max 1 submission per question per user

---

## LiveKit Video Integration

### Room Configuration:
```typescript
// Creating a room for a fixture
const roomName = `fixture-${fixtureId}`;
const room = await livekitClient.createRoom({
  name: roomName,
  emptyTimeout: 300, // 5 min timeout if empty
  maxParticipants: 2, // strictly 1v1
});

// Generate participant tokens
const token = new AccessToken(apiKey, apiSecret, {
  identity: userId,
  name: displayName,
});
token.addGrant({
  room: roomName,
  roomJoin: true,
  canPublish: true,
  canSubscribe: true,
});
```

### Client-Side Video Component:
- Use `@livekit/components-react` for pre-built video tiles
- Layout: two video feeds in the top half of the screen
- Quiz UI in the bottom half
- Mute/camera toggle controls (small, unobtrusive)
- Connection quality indicator

### Video Quality Settings:
- Resolution: 640x480 (sufficient for seeing someone's face, low bandwidth)
- Framerate: 24fps
- Codec: VP8 (widest browser support)
- Adaptive bitrate: let LiveKit handle based on connection quality

---

## Deployment & CI/CD

### Vercel Configuration:
- Connect GitHub repo
- Auto-deploy on push to `main`
- Preview deployments on PRs
- Cron job for fixture expiry (daily)
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
  - `ANTHROPIC_API_KEY`
  - `LIVEKIT_API_KEY`
  - `LIVEKIT_API_SECRET`
  - `LIVEKIT_URL`
  - `NEXT_PUBLIC_APP_URL`
  - `RESEND_API_KEY`
  - `OPENAI_API_KEY`

### Supabase Setup:
- Create project via Supabase dashboard
- Run migrations from `supabase/migrations/` directory
- Enable Realtime on: `fixtures` table only (used for fixture room sync)
- No edge functions — all server logic in Next.js API routes

---

## Project Structure

```
kickin-off/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (dark theme, font loading)
│   ├── page.tsx                  # Landing page (unauthenticated)
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login (Google OAuth)
│   │   └── callback/route.ts     # OAuth callback
│   ├── (app)/                    # Authenticated layout group
│   │   ├── layout.tsx            # App shell with bottom nav (Home / Leagues / Profile)
│   │   ├── home/page.tsx         # Dashboard
│   │   ├── league/
│   │   │   ├── create/page.tsx   # Create league form
│   │   │   ├── [id]/page.tsx     # League detail (table + fixtures)
│   │   │   └── [id]/fixture/[fixtureId]/page.tsx  # Fixture room
│   │   ├── join/[code]/page.tsx  # Join league via invite code
│   │   └── profile/page.tsx      # User profile + stats
│   └── api/                      # API routes (all server logic)
│       ├── fixtures/
│       │   └── [fixtureId]/
│       │       ├── generate-questions/route.ts
│       │       ├── question/[number]/route.ts
│       │       ├── submit-answer/route.ts
│       │       ├── complete/route.ts
│       │       ├── create-room/route.ts
│       │       ├── nudge/route.ts
│       │       └── start/route.ts
│       └── cron/
│           └── expire-fixtures/route.ts
├── components/
│   ├── ui/                       # Base UI components (Button, Card, Input, Modal)
│   ├── auth/                     # Auth-related components
│   ├── league/                   # League table, fixture list, create form
│   ├── fixture/                  # Video room, quiz overlay, timer, scoreboard
│   ├── share/                    # Share buttons, text formatter
│   └── layout/                   # Nav, header, bottom bar
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client (service role)
│   │   └── types.ts              # Generated TypeScript types from schema
│   ├── livekit/
│   │   └── client.ts             # LiveKit client setup
│   ├── questions/
│   │   └── generator.ts          # Claude API question generation logic
│   ├── league/
│   │   ├── round-robin.ts        # Fixture generation algorithm
│   │   └── scoring.ts            # Points calculation, table sorting
│   ├── email/
│   │   └── notifications.ts      # Resend email templates and sending
│   └── utils.ts                  # General utilities
├── hooks/
│   ├── useFixture.ts             # Fixture state machine hook
│   ├── useLeague.ts              # League data fetching
│   ├── useTimer.ts               # Countdown timer hook (derives from started_at)
│   └── useVideoRoom.ts           # LiveKit room management hook
├── supabase/
│   └── migrations/               # SQL migration files
├── public/
│   ├── icons/                    # PWA icons
│   └── manifest.json
├── styles/
│   └── globals.css               # Tailwind imports + CSS variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                   # Cron job configuration
└── package.json
```

---

## Implementation Order (Sprint Plan)

### Week 1: Foundation (April 21-27)
- [ ] **Design:** Create full app design in Google Stitch (all screens) — this is the blocker for all UI work
- [ ] Initialize Next.js project with TypeScript, Tailwind, ESLint
- [ ] Set up Supabase project, create all tables + RLS policies
- [ ] Implement auth flow (Google OAuth via Supabase Auth)
- [ ] Build UI from Stitch design: layout, bottom nav (Home / Leagues / Profile), dashboard, landing page
- [ ] Create league flow: form → generate invite code → store in DB
- [ ] Join league flow: enter code manually or open invite link → join
- [ ] League lobby: show members, "Start League" button for creator (creator only)
- [ ] Deploy to Vercel, confirm end-to-end flow works on mobile

### Week 2: Quiz Engine (April 28 - May 4)
- [ ] Claude API integration: question generation API route
- [ ] Question response validation and storage
- [ ] Round-robin fixture generation algorithm
- [ ] "Start League" action: lock membership, generate all fixtures
- [ ] Fixture list view on league page (all rounds visible)
- [ ] Build quiz UI component: question display, 4 answer buttons, timer
- [ ] Server-side answer validation API route
- [ ] Score calculation and fixture completion logic
- [ ] Test quiz flow end-to-end WITHOUT video (text-only fixture for now)

### Week 3: Video Integration (May 5-11)
- [ ] LiveKit Cloud account setup
- [ ] Video room creation API route (token generation)
- [ ] Client-side LiveKit integration: connect to room, display video feeds
- [ ] Build fixture room layout: video top half + quiz bottom half
- [ ] Fixture state machine: WAITING → READY → QUESTION → REVEAL → RESULT
- [ ] Synchronize state between both players via Supabase Realtime
- [ ] Handle disconnection/reconnection (60-second grace period, 5-0 forfeit)
- [ ] Camera/mic permission handling and fallbacks
- [ ] Nudge mechanic: notification to opponent with deep link
- [ ] Test full fixture flow: video + quiz + scoring

### Week 4: League Mechanics + Polish (May 12-18)
- [ ] League table component with full tiebreaker sorting (Pts → QD → QF → H2H → Alpha)
- [ ] League completion ceremony: winner celebration screen with confetti
- [ ] AI season recap: Claude API text generation + OpenAI TTS audio narration
- [ ] Fixture result share messages (tailored per win/draw, hidden on loss)
- [ ] WhatsApp text share integration (Web Share API)
- [ ] Email notifications via Resend (league started, nudge, reminder, expired, round complete, league complete)
- [ ] Fixture expiry cron job (daily via Vercel cron)
- [ ] Round advancement logic (auto-advance immediately when all fixtures in round are done/expired)
- [ ] Round duration adjustment (creator can change mid-league, takes effect next round)
- [ ] PWA manifest, minimal service worker (installability + offline fallback only)
- [ ] Profile page: basic stats (played, W/D/L, correct %)
- [ ] Sound design: subtle chimes/buzzes, haptic feedback, mute toggle
- [ ] UI polish: animations, transitions, loading states, error states
- [ ] Empty states for dashboard, league with no fixtures, etc.

### Week 5: World Cup Mode + Testing (May 19-25)
- [ ] World Cup 2026 question mode (themed prompts for Claude API)
- [ ] World Cup branding/theming toggle in UI
- [ ] Internal testing: create test leagues with 6-8 real people
- [ ] Bug fixing from test feedback
- [ ] Performance audit: Lighthouse score, bundle size, load time
- [ ] Mobile browser testing: Safari iOS, Chrome Android, Samsung Internet
- [ ] Edge case testing: poor connection, multiple tabs, rapid answer tapping

### Week 6: Beta + Content (May 26 - June 1)
- [ ] Beta launch: open to ~30 users across 4-5 test leagues
- [ ] Monitor Supabase usage, LiveKit minutes, Claude API costs
- [ ] Fix critical bugs from beta feedback
- [ ] Landing page finalization with demo video/animation
- [ ] OG image and meta tags for social sharing
- [ ] Final security review: RLS policies, API key exposure, rate limiting

### Week 7: Pre-Launch (June 2-8)
- [ ] Final bug fixes from beta
- [ ] Soft launch: open registration via landing page
- [ ] Load testing: simulate 50 concurrent fixtures
- [ ] Prepare for World Cup opening (June 11)
- [ ] Ensure question generation handles World Cup 2026 topics accurately
- [ ] Monitor and prepare for scale

---

## Testing Strategy

### Unit Tests (Vitest):
- Round-robin fixture generation: verify all players play each other exactly once
- Score calculation: verify 3/1/0 point allocation for W/D/L
- League table sorting: verify full tiebreaker chain (Pts → QD → QF → H2H → Alpha)
- Question validation: verify JSON structure from Claude API
- Timer derivation: verify question windows calculated correctly from started_at

### Integration Tests:
- Auth flow: sign up → create league → invite → join
- Fixture flow: initiate → answer questions → complete → scores update
- API route tests: answer validation timing (including grace period), concurrent submissions
- Expiry flow: fixture past deadline → cron marks expired → 0 points both

### Manual Testing Checklist:
- [ ] Create league on iPhone Safari
- [ ] Join league via link on Android Chrome
- [ ] Join league via manual code entry
- [ ] Play fixture with video on both platforms
- [ ] Share league table via WhatsApp (text format)
- [ ] Receive email notification (all types)
- [ ] Install PWA to homescreen
- [ ] Test with poor network (throttle to 3G in DevTools)
- [ ] Test camera permission denial flow
- [ ] Test fixture with one player disconnecting (verify 60s window + 5-0 forfeit)
- [ ] Test expired fixture (verify 0 points both)
- [ ] Test nudge mechanic

---

## Performance Targets

- **Lighthouse Score:** 90+ (Performance, Accessibility, Best Practices)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Bundle Size:** < 200KB initial JS (code-split aggressively)
- **Video Connection Time:** < 3s to establish peer connection
- **Question Generation:** < 2s from API call to questions stored (pre-generated during WAITING state)
- **Answer Submission:** < 200ms round-trip to server

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic (Claude API for question generation)
ANTHROPIC_API_KEY=sk-ant-...

# LiveKit
LIVEKIT_API_KEY=API...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://xxxxx.livekit.cloud

# App
NEXT_PUBLIC_APP_URL=https://kickinoff.co.uk

# Resend (email notifications)
RESEND_API_KEY=re_...

# OpenAI (TTS for season recaps)
OPENAI_API_KEY=sk-...
```

---

## V1.1 Roadmap (Post-MVP)

Features deferred from MVP for post-launch development:

- **Push notifications** (Web Push API) — replace/supplement email notifications
- **League table image sharing** (Satori/html-to-image) — branded shareable images
- **Gamification & profile expansion** — badges, achievements, streaks, detailed stats, head-to-head records
- **Fixture-level stats** — on result screen: questions correct, average answer time, fastest answer
- **Larger leagues** — 10+ players with non-round-robin formats (Swiss system, random draw)
- **Additional auth methods** — email magic link, Apple Sign-In
- **Analytics tooling** — Posthog for funnel analysis and retention tracking
- **Sudden-death tiebreaker** — optional mode for decisive results
- **Premier League season mode** — themed for 2026-27 season (August launch)
