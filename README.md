# AI Interview Mentor

A premium, futuristic AI-powered mock interview & career preparation platform.

![stack](https://img.shields.io/badge/React-19-61dafb) ![stack](https://img.shields.io/badge/Vite-8-646cff) ![stack](https://img.shields.io/badge/Tailwind-4-38bdf8) ![stack](https://img.shields.io/badge/Three.js-R3F-000000)

## What it is

A single-page marketing product for an AI interview coach — a hybrid experience
mixing a 3D human-like AI interviewer avatar, a glowing AI orb, holographic
interface elements, glassmorphism cards and floating performance metrics on a
dark futuristic UI.

The entire page optimizes for one goal: **get the user to start an AI mock interview**.

## Tech stack

- **React 19 + Vite 8** (TypeScript)
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin) — design tokens in `index.css`
- **Framer Motion** — scroll reveals, parallax, counters, animated charts
- **Three.js + React Three Fiber + drei** — lazy-loaded 3D avatar scenes
- **Lucide React** icons

## Getting started

```bash
npm install
npm run dev       # start dev server
npm run build     # typecheck + production build
npm run preview   # preview the production build
npm run lint      # oxlint
```

## Structure

```
src/
├── App.tsx                        # page assembly
├── index.css                      # Tailwind theme + utilities (glass, gradients, keyframes)
├── data/content.ts                # all mock data for feedback/analytics
└── components/
    ├── Header.tsx                 # floating glass header + mobile menu
    ├── Hero.tsx                   # cinematic hero + parallax 3D stage
    ├── TrustIntro.tsx             # animated stat counters
    ├── HowItWorks.tsx             # 3-step timeline
    ├── InterviewModes.tsx         # 4 mode cards
    ├── InterviewDemo.tsx          # live "interview room" interface
    ├── FeedbackDashboard.tsx      # score ring + metric bars + AI feedback
    ├── PerformanceChart.tsx       # animated SVG progress graph
    ├── Features.tsx               # why-us cards
    ├── CTA.tsx                    # final conversion section
    ├── Footer.tsx                 # clean footer
    ├── AuroraBackground.tsx       # fixed gradient/grid/grain background
    ├── FloatingMetricCard.tsx     # hero floating stat card
    ├── three/                     # R3F scenes (avatar, orb, particles)
    └── ui/                        # Reveal, SectionHeading, Counter
```

## Notes

- The 3D scenes are code-split (`React.lazy`) so the avatar chunk only loads
  when visible — the initial bundle stays lean.
- A soft `fallback` / loading placeholder is shown while the scene chunk loads,
  and a WebGL fallback is rendered when a browser can't create a WebGL context.
- All feedback, scores and analytics are mock data — the current version focuses
  on the frontend experience and visual design.