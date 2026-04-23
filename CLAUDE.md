@AGENTS.md

# Kickin' Off

Football quiz PWA where friends compete in head-to-head trivia leagues via video call.

## Project

- **Domain:** kickinoff.co.uk
- **Repo:** https://github.com/TameImpy/kickinoff
- **Spec:** PROJECT_SPEC.md (single source of truth for all product decisions)
- **Design:** design/stitch-reference.html + design/DESIGN.md (single source of truth for all UI)
- **GitHub Issues:** 18 issues (#1 PRD, #2-#18 vertical slices in dependency order)

## Stack

- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Supabase (PostgreSQL, Auth via Google OAuth, Realtime for fixture rooms only)
- LiveKit Cloud (1-on-1 video)
- Claude API (question generation), OpenAI TTS (season recap narration)
- Vercel (hosting, API routes, cron), Resend (email notifications)

## Commands

- `npm run dev` — start dev server
- `npm test` — run all tests (Vitest)
- `npm run test:watch` — watch mode
- `npm run build` — production build
- `npm run lint` — ESLint

## Architecture

- All server logic lives in Next.js API routes (no Supabase Edge Functions)
- Supabase is data/auth/realtime only
- Realtime used ONLY inside fixture rooms during active play
- Client never queries the questions table directly — all question data flows through API routes
- Shared `started_at` timestamp is single source of truth for all fixture timing
- 1-second hidden grace period on answer submission (client shows 10s, server accepts 11s)

## Design System

- **Colours:** Green primary (#00e676), purple accent (#BD00FF), cyan tertiary (#00dbe9), dark OLED base (#0D0D0D)
- **Typography:** Space Grotesk (headlines/labels), Spline Sans (body)
- **Style:** Cyber-brutalism. Sharp corners (0px radius), clipped/chamfered buttons, neon glows, no soft shadows
- **All UI must closely match the Stitch design spec**

## Key Decisions

- Synchronous video play only — no async fallback (video call IS the product)
- Alternating questions (odd=home, even=away) — accessibility by design
- Expired fixtures = 0 points both (not a draw)
- Forfeit (disconnect >60s) = 5-0 win for opponent
- Draws stay as draws, no tiebreaker
- Google OAuth only for MVP
- League table sort: Pts → QD → QF → H2H → Alphabetical
- Round-robin 3-8 players, fixed question mode per league
- Auto-advance rounds immediately when all fixtures done/expired
- Text share only for MVP (image share is V1.1)

## TDD

All pure logic modules are developed test-first using Vitest. Current test coverage:
- `lib/league/invite-code.ts` — code generation
- `lib/league/round-robin.ts` — circle method fixture scheduling
- `lib/league/scoring.ts` — points + tiebreaker sorting
- `lib/fixture/timer.ts` — question window derivation
- `lib/questions/validator.ts` — Claude API response validation

## Code Style

- Keep it simple. No over-engineering, no speculative features
- Prefer editing existing files over creating new ones
- No unnecessary abstractions — three similar lines > premature helper
- Tests verify behaviour through public interfaces, not implementation details
