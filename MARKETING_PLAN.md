# KickOff — Tactical Marketing Plan

## World Cup 2026 Launch Strategy: Complete Execution Guide

**Timeline:** April 18 – July 19, 2026
**Target Audience:** UK males aged 18-40 who follow football, use WhatsApp group chats, and enjoy competitive banter with friends
**Budget Assumption:** Bootstrap / minimal budget (under £1,000 total)
**Primary KPI:** Leagues created (each league = 3-8 users acquired organically)

---

## Key Dates Calendar

| Date | Event | Marketing Action |
|------|-------|-----------------|
| May 19 | Content creation begins | Start "build in public" series |
| May 26 | Landing page live | Waiting list opens, teaser content drops |
| June 2 | Creator outreach window | Contact 15-20 football creators |
| June 8 | Soft launch | Open to waiting list + beta users |
| June 11 | World Cup opens (Mexico vs South Africa) | "Create your World Cup league" campaign |
| June 17 | **England vs Croatia, 9pm UK** | **Primary launch moment** — all content drops |
| June 23 | England vs Ghana, 9pm UK | Second wave push, share early user stats |
| June 27 | England vs Panama, 10pm UK | "Who's top of your league?" content |
| June 28+ | Knockout rounds begin | Shift to UGC and social proof |
| July 19 | World Cup Final | End-of-tournament recap content |

---

## Phase 1: Pre-Build Content — "Build in Public" (Now – May 25)

### Strategy
Document the journey from idea to launch. This creates multiple assets simultaneously: marketing content, a personal brand narrative, accountability, and a potential audience if the product succeeds. Even if the app doesn't take off, the content has standalone value as a founder/builder story.

### LinkedIn Blog Series

**Why LinkedIn:** Your professional network is your warmest audience. They'll share it if the story is compelling, and it positions you as someone who ships things — which has career value regardless of outcome.

**Posting cadence:** 2x per week (Monday and Thursday mornings, 7:30-8:30am UK for peak LinkedIn engagement)

**Series title:** "54 Days to Launch: Building a Football App for the World Cup"

**Post schedule:**

| Week | Post 1 (Monday) | Post 2 (Thursday) |
|------|-----------------|-------------------|
| Apr 21 | "I'm building a football quiz app and launching it for the World Cup. Here's why." — The idea, the gap in the market, the timeline. Hook: the audacity of a 7-week build. | "Day 4: I chose my tech stack in 2 hours. Here's what I picked and why." — Supabase + LiveKit + Claude API + Next.js. Practical, technical, useful to other builders. |
| Apr 28 | "The hardest UX problem: making two people video call inside a quiz." — The fixture room design challenge. Show early wireframes/sketches. | "I asked AI to generate 10,000 football questions. Here's what went wrong (and right)." — The prompt engineering journey for question generation. |
| May 5 | "Week 3: Video calling works. Sort of." — LiveKit integration, the first successful fixture between two phones. Screen recording. | "The feature I almost built that would have killed my timeline." — Scope creep temptation. What you cut and why. Resonates with every builder. |
| May 12 | "The WhatsApp problem: how do you make an app spread through group chats?" — Share mechanics, league table images, invite links. Growth thinking. | "My app needs to handle 100 concurrent video calls. It cost me £0 to test that." — LiveKit free tier, Supabase free tier, Vercel free tier. Cost breakdown. |
| May 19 | "3 weeks to go. Here's what the app looks like." — First full demo video. Show the fixture room, league table, the full loop. This is the big reveal. | "I'm letting 30 people break my app this week." — Beta launch. Ask for volunteers in comments (generates engagement + beta users). |
| May 26 | "Beta feedback: what my mates actually said after playing." — Real reactions, real quotes, real screenshots. Authentic. | "The landing page is live. World Cup mode is ready. 14 days to go." — Link to landing page. CTA: join the waiting list. |
| Jun 1 | "The creator DMs I'm sending this week (and why most won't reply)." — Honest take on influencer outreach as a solo founder. | "7 days to kick-off. The app is live. Here's what happens next." — Soft launch announcement. |

**Post format guidelines:**
- Open with a hook (first 2 lines visible in feed must compel a "see more" click)
- Keep under 1,300 characters (LinkedIn sweet spot for engagement)
- Include 1 image or video per post (screen recording, screenshot, sketch, chart)
- End with a question or CTA to drive comments
- Use 3-5 relevant hashtags: #buildinpublic #startupjourney #footballtech #worldcup2026 #indiedev
- Tag relevant people sparingly (only if genuinely relevant, not spam)

**Claude Tool for Execution:**
- Use **Claude.ai** (this conversation or a Claude Project) to draft each post. Provide the raw material/update and ask Claude to write in your voice. Feed it your previous posts so it learns your tone.
- Create a **Claude Project** called "KickOff Marketing" with the project description including your brand voice, target audience, and this marketing plan as a knowledge file. Then you can ask it to draft posts, emails, and outreach messages with full context.

### Video Content (Optional but High-Impact)

If you're comfortable on camera, record short (60-90 second) videos to accompany key LinkedIn posts and cross-post to TikTok/Reels:

**Key videos to make:**
1. "I'm building an app in 7 weeks for the World Cup" — face-to-camera, explain the idea (Week 1)
2. Screen recording of the first working fixture — the "it works!" moment (Week 3)
3. Demo video: full walkthrough of creating a league and playing a fixture (Week 5)
4. Launch day: "It's live. Here's what happened." (Week 7)

**Tools:**
- Record on your phone (portrait for TikTok/Reels, square for LinkedIn)
- Edit with CapCut (free, mobile-first, good for quick cuts and captions)
- Auto-captions are essential (80% of social video is watched muted)

---

## Phase 2: Pre-Tournament Awareness (May 26 – June 10)

### Landing Page

**URL:** kickoff.app (or similar — check domain availability)

**Purpose:** Convert curious visitors into waiting list sign-ups

**Content:**
- Hero: "Think you know more about football than your mates? Prove it." + demo video/animation
- 3-step how-it-works: Create League → Play Fixtures on Video → Win the League
- "World Cup 2026 Mode" badge — emphasise the timing
- Email capture: "Get early access before the World Cup kicks off"
- Social proof (once available): "237 people on the waiting list"

**Tech:** Build as part of the Next.js app (the `/` route when unauthenticated). Email capture via Supabase — just a simple `waitlist` table with email + timestamp.

**Claude Tool for Execution:**
- Use **Claude.ai** to write all landing page copy. Provide your target audience description and ask for 3 variations of the hero headline and subhead. A/B test if you have time (Vercel supports edge-based A/B).
- Use **Claude Code** to build the landing page component itself.

### Teaser Content (Social)

**Goal:** Generate curiosity and waiting list sign-ups in the 2 weeks before the tournament.

**Content pieces to create:**

1. **"Which World Cup host city is this?" quiz clip** (15-30s TikTok/Reel)
   - Show a stadium photo, 4 options, 5-second timer
   - Mimics the in-app experience but as standalone content
   - End card: "Want to play this against your mates? Link in bio"
   - Create 3-4 of these across the 2 weeks

2. **"I built an app where you FaceTime your mates during a football quiz"** (60s explainer)
   - Show the fixture room working
   - Emphasise the social/funny element — reactions when someone gets a question wrong
   - This is your main viral-attempt piece

3. **"England's World Cup squad: how many can you name in 30 seconds?"**
   - Face-to-camera challenge format
   - Relate it back to the app: "This is what playing KickOff feels like, except your mate is watching you panic"

**Claude Tool for Execution:**
- Use **Claude.ai** to generate quiz questions for the teaser clips. Ask: "Give me 5 multiple-choice football trivia questions that would work well as 15-second TikTok quiz clips — visually interesting, debatable enough to drive comments."
- Use **Claude.ai** to write captions and hooks for each piece of content.

### Email / Waiting List Nurture

If you capture emails via the landing page, send 2-3 emails before launch:

1. **Email 1 (June 1):** "You're on the list. Here's what KickOff is." — Brief explainer, screenshot, "we launch before the World Cup kicks off"
2. **Email 2 (June 8):** "We're live. Create your league now." — Direct CTA, link to app, "invite your mates before England play Croatia on June 17"
3. **Email 3 (June 16):** "England play tomorrow. Is your league ready?" — Urgency, final push

**Claude Tool for Execution:**
- Draft all emails in **Claude.ai** or your Claude Project
- Send via a simple transactional email service (Resend.com — free tier: 3,000 emails/month, great API, works with Next.js)

---

## Phase 3: Tournament Launch (June 11 – June 27)

### Launch Day Strategy: June 11 (World Cup Opens)

**The World Cup starts but England don't play until June 17.** This 6-day window is your ramp-up period.

**Actions:**
- Open app to public (not just waiting list)
- Post: "The World Cup starts today. Your league starts whenever you're ready." — LinkedIn + TikTok/Reels
- Activate "World Cup 2026" question mode in the app
- Email waiting list: "We're live. Create your league."
- Change landing page hero to World Cup themed messaging

### Peak Moment: June 17 (England vs Croatia, 9pm UK)

**This is your biggest single opportunity.** Football conversation in the UK peaks on England match days. Everything should be timed around this.

**Content schedule for June 17:**

| Time (UK) | Action |
|-----------|--------|
| 8:00am | LinkedIn post: "Today England play Croatia. Tonight, test if you actually know your football. KickOff is live." |
| 12:00pm | TikTok/Reel: Quick quiz clip — "3 questions about England vs Croatia history. Can you get them all?" |
| 3:00pm | Tweet/post: "6 hours until kick-off. Still time to create your World Cup league and get your first fixture in before the match." |
| 5:00pm | Push notification to all users: "England play tonight! Have you played your fixture yet?" |
| 7:00pm | If any creator content is ready, this is when it should drop (2 hours before kick-off, people are on their phones, killing time) |
| Post-match | "England [won/lost/drew]. How did YOUR fixture go? Share your league table." |

### Creator Content Drops

**Timeline:**
- May 26–June 2: Identify and list 15-20 target creators
- June 2–8: Send outreach DMs/emails
- June 8–15: Creators receive early access, play test fixtures
- June 15–17: Creators post their content (ideally day of or day before England's first game)

**Target creator profile:**
- UK-based football content creators on TikTok, YouTube, or Instagram
- 10K–100K followers (mid-tier, high engagement, affordable/free)
- Content style: football banter, quiz content, opinions, debates
- NOT: skills/freestyle creators, highlights channels, news accounts

**Example creators to research and approach (search for current active accounts):**
- Football quiz specialists on TikTok
- "Football Twitter" personalities who've moved to TikTok/YouTube
- Podcast hosts with small but engaged football audiences
- FPL (Fantasy Premier League) community creators
- Football meme accounts that also do original content

**Outreach message template:**

```
Hey [name],

I've built a football quiz app called KickOff where you play head-to-head 
against your mates on video call — like FaceTime meets a pub quiz. It 
generates AI questions, has leagues with a 3-points-for-a-win system, 
and we've got a World Cup 2026 mode for the tournament.

I'm launching it for the World Cup and I think it'd make class content — 
basically you and a mate going head-to-head on camera, reactions and all. 
The format is ready-made for a clip.

Happy to give you early access this week if you want to try it. 
No strings — if you like it and want to post about it, amazing. 
If not, no worries at all.

Here's a 30-second clip of what it looks like: [link to demo video]

Cheers,
Matt
```

**Claude Tool for Execution:**
- Use **Claude.ai** to personalise outreach messages per creator. Feed it their profile/content style and ask for a tailored version of the template.
- Use **Claude.ai** to research creators: "Find me 10 UK-based football TikTok creators with 10K-100K followers who make quiz, banter, or opinion content" (Claude can help identify names and profiles to then verify manually).
- If you have **Gmail connected**, use Claude to help draft outreach emails directly.

### Ongoing Content During Group Stage (June 11–27)

**Daily content rhythm:**

- **Match day content (whenever any big game is on):** Post a single quiz question as a Story/Reel. "Can you answer this before kick-off?" Always end with app CTA.
- **League table shares:** Repost/screenshot user-shared league tables (with permission). "This league has a 3-way tie going into the final round. Who's winning yours?"
- **Stats and milestones:** "427 fixtures played in the first week of the World Cup. Average score: 5.8 – 4.2. What's your best?" Make the numbers part of the conversation.
- **User reactions:** If anyone screen-records a funny moment from a fixture (and they will — the video call format guarantees funny reactions), ask permission to repost. UGC is more powerful than anything you can create yourself.

**Claude Tool for Execution:**
- Use **Claude.ai** daily to generate that day's quiz question for social content. Ask: "Give me one multiple-choice football question that's relevant to tonight's World Cup match ([teams]), that would work as a TikTok Story with 4 answer options."
- Use **Claude.ai** to write daily social captions. Feed it the day's match schedule and ask for a relevant post.

---

## Phase 4: Knockout Rounds & Growth (June 28 – July 19)

### Strategy Shift: From Awareness to Social Proof

By this point, you should have real users, real data, and real stories. The marketing shifts from "here's what the app does" to "here's what people are doing with it."

**Content themes:**
- User testimonials and stories ("This league came down to the last fixture")
- Aggregate stats ("10,000 fixtures played during the World Cup so far")
- Feature teasers ("Badges and achievements coming in V1.1")
- Competitive angle ("The average player gets 6.2 out of 10 right. Can you beat that?")

**If England are still in the tournament:** Every match day continues to be a spike. Double down on England-specific content.

**If England are knocked out:** Pivot messaging. "The football doesn't stop because England did. Your league is still live." Focus on the general World Cup excitement. The 48-team format means there's always a compelling match happening.

### Retention Mechanics (In-App)

- Push notification when a new round of fixtures is generated: "Round 3 is live! You're playing {name} next."
- Weekly "league update" push: "You're 2nd in {league}. 1 point behind {leader}."
- If a league is completed during the World Cup, prompt: "Want to start a new league? World Cup knockout edition?"

---

## Phase 5: Post–World Cup (July 20+)

### Transition Plan

The World Cup ends July 19. The risk is a usage cliff. Prepare for this:

1. **End-of-tournament content:** "X fixtures played during the World Cup. Thank you to everyone who played." Community celebration.
2. **Feature drop timing:** Launch badges/achievements (V1.1) in the week after the World Cup ends. Gives existing users a reason to keep playing.
3. **Premier League season:** The 2026-27 Premier League season starts mid-August. Create "Premier League Mode" question sets and market around the season opener.
4. **Retention email:** To all users, 1 week after World Cup: "The World Cup is over. Your league doesn't have to be. Start a new season."

---

## Distribution Channels — Ranked by Impact

### 1. WhatsApp (Highest Impact, Zero Cost)
**Why:** Your target audience lives in WhatsApp groups. The league invite link and shareable league table are designed to land here.

**Tactics:**
- Make the "Share to WhatsApp" button the most prominent share option in the app
- Pre-format the WhatsApp share message with emoji, league name, standings, and invite link
- The league table share image should be perfectly sized for WhatsApp (1080x1080)
- Every league creation should end with a share prompt — don't let users skip this step

**Claude Tool:** Use Claude to A/B test different WhatsApp share message formats. Ask: "Write me 3 versions of a WhatsApp message that someone would send to their friend group to invite them to a football quiz league. It needs to be casual, funny, and include a link."

### 2. TikTok / Instagram Reels (High Impact, Time Investment)
**Why:** The fixture room format (two people on video, reacting to quiz questions) is inherently short-form video content. It films itself.

**Tactics:**
- Post 3-4x per week during the World Cup
- Mix: standalone quiz questions (top-of-funnel) + fixture recordings (mid-funnel) + league table posts (bottom-funnel)
- Use trending audio where appropriate (but don't force it)
- Hashtags: #football #worldcup2026 #footballquiz #footballtiktok #kickoff

### 3. LinkedIn (Medium Impact, High Credibility)
**Why:** The "build in public" series creates a narrative arc that LinkedIn audiences love. It won't drive mass downloads but it builds credibility, attracts early adopters, and could attract press/investors if the app gains traction.

**Tactics:** See Phase 1 above for the full posting schedule.

### 4. Reddit (Medium Impact, Requires Authenticity)
**Why:** r/soccer, r/PremierLeague, r/football have massive engaged audiences. But Reddit aggressively downvotes self-promotion.

**Tactics:**
- Do NOT post "check out my app" — you will be downvoted and possibly banned
- Instead, post the story: "I built a football quiz app in 7 weeks for the World Cup — here's what I learned" in r/SideProject or r/webdev
- Share genuinely interesting quiz questions in football subreddits WITHOUT mentioning the app. Build karma first. If people ask "where did you get this?" — then mention it
- Consider r/WorldCup2026 closer to the tournament

### 5. Twitter/X (Lower Impact but Fast)
**Why:** Football Twitter is massive but increasingly fragmented. Good for real-time match-day engagement.

**Tactics:**
- Post quiz questions during/before big matches
- Engage in football discussions naturally
- Quote-tweet football debates with "Settle this with a KickOff fixture"

### 6. Football Forums & Communities
- The Football Forum
- Rival football fan forums (club-specific)
- Discord servers for football communities
- Facebook groups (large football discussion groups)

**Approach:** Same as Reddit — add value first, promote second.

---

## Content Production Toolkit

### What You Need:
1. **Phone with decent camera** — for face-to-camera videos and screen recordings
2. **CapCut** (free app) — for editing short-form video, adding captions, cuts
3. **Canva** (free tier) — for static social graphics, story templates, LinkedIn post images
4. **Screen recording** — iOS/Android built-in screen record for app demo clips
5. **Claude.ai** — for all copywriting (posts, emails, outreach, captions, quiz questions)

### Claude-Specific Workflow:

**Set up a Claude Project ("KickOff Marketing"):**

Project knowledge files to upload:
- This marketing plan (as a reference document)
- Your brand voice guide (write 3-4 paragraphs describing your tone: direct, informal, football-literate, slightly cheeky, not corporate)
- The competitor research document (from earlier)
- Examples of your LinkedIn writing style (paste 2-3 previous posts)

**Then use the project for:**
- "Draft this week's LinkedIn post. Here's what happened this week: [raw notes]"
- "Write me 5 TikTok captions for quiz question clips about the World Cup"
- "Personalise this outreach message for @[creator] who makes [type] content"
- "Generate today's daily quiz question — it should relate to tonight's match: [team] vs [team]"
- "Write the pre-match push notification for England vs Ghana"
- "Draft a WhatsApp message template for sharing a league invite"
- "Write a Reddit post about building this app for r/SideProject — make it genuine, not salesy"

**For longer content (blog posts, email sequences):**
- Use Claude.ai with your project context
- Ask for drafts in your voice
- Edit for authenticity — Claude's first draft + your edits = content that sounds like you but is faster to produce

**Claude Code for marketing-adjacent tasks:**
- Building the landing page
- Implementing the share-to-WhatsApp flow
- Generating the league table share images (Satori/OG image pipeline)
- Setting up the email capture and Resend integration
- Analytics event tracking setup

---

## Measurement & Success Metrics

### Primary Metrics (track from day 1):
| Metric | Week 1 Target | Month 1 Target |
|--------|--------------|----------------|
| Leagues created | 20 | 200 |
| Total users | 80 | 1,000 |
| Fixtures played | 50 | 800 |
| Fixture completion rate | 70% | 75% |
| Avg. questions correct per fixture | Track only | Track only |

### Secondary Metrics:
- **Viral coefficient:** Leagues created per user (target: 0.3 — i.e. 1 in 3 users creates their own league)
- **Invite conversion:** % of invite link clicks that result in sign-ups
- **Retention:** % of users who play a second fixture within 7 days of their first
- **Share rate:** % of completed fixtures where the league table is shared
- **NPS:** Ask after 3rd fixture: "How likely are you to recommend KickOff to a friend?" (1-10)

### Tools:
- **Posthog** (free tier): Event tracking, funnels, retention analysis
- **Vercel Analytics**: Page views, geography, devices
- **Supabase Dashboard**: DB queries for fixture/league/user counts
- **Manual tracking:** Spreadsheet for creator outreach status, content performance

---

## Budget Breakdown

| Item | Cost | Notes |
|------|------|-------|
| Domain name | £10-15/year | kickoff.app or similar |
| Vercel | Free | Hobby tier is sufficient for MVP |
| Supabase | Free | Free tier: 500MB DB, 50K auth users |
| LiveKit Cloud | Free | 5,000 participant-minutes/month |
| Claude API | ~£5-20/month | Based on fixtures played |
| Resend (email) | Free | 3,000 emails/month |
| Posthog | Free | 1M events/month |
| Creator payments (optional) | £0-1,000 | £100-200 per creator × 3-5 creators |
| Canva Pro (optional) | Free/£10/month | Free tier is usually sufficient |
| **Total** | **£10 – £1,050** | |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| App not ready by June 11 | Ruthlessly cut scope. The core loop (league + fixture + video + questions) is the ONLY priority. Cut badges, cut async mode, cut everything else. |
| No creators respond | The app doesn't need creators to work. WhatsApp sharing is the primary distribution channel. Creators are a bonus, not a dependency. |
| Low waiting list sign-ups | Focus on personal network first. You only need 5 leagues of 6 people (30 users) to have a meaningful beta. Your friends + their friends. |
| Video call quality issues | Test extensively on mobile before launch. Have a graceful fallback (audio-only mode). LiveKit handles adaptive bitrate automatically. |
| AI generates wrong questions | Implement a report-question button. Cache and review flagged questions. Add a verification layer using a football data API for stat-based questions. |
| England get knocked out early | Pivot messaging to general World Cup. The app isn't England-specific — it's football-specific. The tournament runs until July 19 regardless. |
| Post-World Cup usage drops | Expected. Plan V1.1 features (badges, Premier League mode) for August to coincide with the new season. |

---

## Quick Reference: Claude Tools for Each Task

| Task | Best Claude Tool |
|------|-----------------|
| Drafting LinkedIn posts, emails, captions | **Claude.ai** (with a Project for context) |
| Personalising creator outreach messages | **Claude.ai** (paste creator profile, ask for tailored message) |
| Generating daily quiz questions for social content | **Claude.ai** or **Claude API** (in-app) |
| Building the app, landing page, share features | **Claude Code** (with this project spec as context) |
| Writing Reddit posts, forum introductions | **Claude.ai** |
| Drafting push notification copy | **Claude.ai** |
| Researching competitors, creators, trends | **Claude.ai with web search** |
| Analysing beta feedback and prioritising fixes | **Claude.ai** (paste feedback, ask for themes + priorities) |
| Creating email sequences | **Claude.ai** (draft series, maintain consistent voice) |
| Writing App Store listing (if going native later) | **Claude.ai** |
| Writing the "build in public" blog series | **Claude.ai** (feed raw notes from the week, ask for draft in your voice) |
