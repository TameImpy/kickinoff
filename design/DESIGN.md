---
name: Velocity Quiz Engine
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d4c0d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9d8ba0'
  outline-variant: '#514255'
  surface-tint: '#ecb2ff'
  primary: '#ecb2ff'
  on-primary: '#520071'
  primary-container: '#bd00ff'
  on-primary-container: '#ffffff'
  inverse-primary: '#9900cf'
  secondary: '#ffffff'
  on-secondary: '#283500'
  secondary-container: '#c3f400'
  on-secondary-container: '#556d00'
  tertiary: '#00dbe9'
  on-tertiary: '#00363a'
  tertiary-container: '#00838b'
  on-tertiary-container: '#ffffff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f8d8ff'
  primary-fixed-dim: '#ecb2ff'
  on-primary-fixed: '#320047'
  on-primary-fixed-variant: '#74009f'
  secondary-fixed: '#c3f400'
  secondary-fixed-dim: '#abd600'
  on-secondary-fixed: '#161e00'
  on-secondary-fixed-variant: '#3c4d00'
  tertiary-fixed: '#7df4ff'
  tertiary-fixed-dim: '#00dbe9'
  on-tertiary-fixed: '#002022'
  on-tertiary-fixed-variant: '#004f54'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Spline Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Spline Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Spline Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

The design system is built to evoke the high-octane energy of a competitive e-sports arena. It targets a Gen-Z and Millennial demographic that thrives on social validation and fast-paced gameplay. The personality is unapologetically loud, confident, and precise.

Drawing from **High-Contrast Bold** and **Cyber-Brutalism**, the system utilizes aggressive visuals to maintain user engagement. The UI is designed to feel like a high-performance heads-up display (HUD), prioritizing speed of recognition and action. Every interaction should feel like a "win," using sharp angles and vibrant color bursts to reward user input.

## Colors

The palette is optimized for OLED mobile displays, utilizing a "Deep Obsidian" base to make neon accents pop. 

- **Primary (Electric Purple):** Used for primary actions, branding, and active states. It represents the "energy" of the platform.
- **Secondary (Neon Green):** Reserved for "correct" states, success feedback, and high-priority call-to-actions. It provides maximum contrast against the obsidian background.
- **Tertiary (Cyber Cyan):** Used for secondary interactive elements and information callouts.
- **Surface:** A series of dark greys (#1A1A1A, #262626) are used to create structural depth without losing the "dark mode" intensity.

## Typography

This design system utilizes **Space Grotesk** for headlines and interactive labels to provide a technical, futuristic edge. Its geometric construction mirrors the sharp-angled UI components. **Spline Sans** is used for body copy and multi-line text to ensure high readability during fast-paced quiz sessions.

All headlines should favor tight tracking and uppercase styling for a more aggressive, "news-ticker" feel. Numerical data (scores, timers, player counts) should always use Space Grotesk to emphasize the competitive nature of the stats.

## Layout & Spacing

This design system uses a **fluid mobile-first grid** based on a 4px baseline. On mobile devices, the system adheres to a 4-column layout with 20px outer margins. On larger screens, it transitions to a 12-column centered layout.

Spacing is tight and intentional to maximize "above the fold" content for quick-fire questioning. Vertical rhythm is driven by the 4px increment, ensuring that all elements, especially progress bars and timers, align to a strict geometric grid. Elements should feel packed and high-density, simulating a professional gaming interface.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Hard Glows** rather than traditional soft shadows. 

1.  **Level 0 (Base):** Deep Obsidian (#0D0D0D).
2.  **Level 1 (Cards/Containers):** Dark Grey (#1A1A1A) with 1px solid borders in #262626.
3.  **Level 2 (Interactive):** Elements that are interactive use a secondary border or a "Neon Underglow"—a small, high-intensity outer glow (5-10px blur) using the Primary or Secondary color.

Avoid background blurs or frosted glass. The look must remain "hard" and digital. Use 100% opacity for most containers to maintain high contrast and visual clarity during rapid movement.

## Shapes

The design system adopts a **Sharp (0px)** roundedness philosophy. This creates a ruthless, professional aesthetic reminiscent of high-end gaming hardware and technical blueprints.

To add visual interest without using curves, use **clipped corners** (45-degree chamfers) on primary buttons and container headers. This geometric detailing reinforces the "cutting-edge" vibe of the platform. All progress bars, input fields, and avatars must be strictly rectangular.

## Components

### Buttons
Primary buttons are solid Electric Purple with black text, featuring a clipped top-right corner. Secondary buttons use a 2px Neon Green border with no fill. Every button press should trigger a "glow" state where the border intensity increases.

### Quiz Cards
Cards are the primary container for questions. They feature a 1px border. When a user selects an answer, the card border should immediately switch to Neon Green (Correct) or Red (Incorrect) with a matching inner glow.

### Chips & Badges
Small rectangular tags used for categories (e.g., "POP CULTURE"). These use a Cyber Cyan outline and Space Grotesk Bold at 10px.

### Inputs
Search and text inputs are flat #1A1A1A boxes with a bottom-only 2px border in Electric Purple. This mimics a command-line interface.

### The Pulse (Leaderboard)
A specialized list component where the top 3 players are highlighted with a vertical neon stripe on the left side of their row.

### Timer Bar
A full-width, 4px high bar that sits at the top of the screen, depleting from right to left in Neon Green, turning Electric Purple when less than 5 seconds remain.