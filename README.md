<div align="center">

# CodeZero

### The interview prep system that treats consistency as the product.

**Patterns over grind. Schedules over chaos. Revision over forgetting.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## Product Vision

Most engineers preparing for interviews do not lack problems — they lack **structure**.

Random LeetCode sessions feel productive until revision decays. Topics get half-learned. Overdue queues pile up. Motivation spikes, then collapses. The real failure mode is not ability — it is **no system** that turns practice into a daily loop with memory built in.

**CodeZero** is a frontend platform built around that insight: interview readiness is a **habit engineering problem**, not a problem-count problem.

The product connects four ideas into one flow:

| Problem | CodeZero response |
|--------|-------------------|
| Unstructured grinding | **Explore** — enroll topics and study plans into active schedules |
| No daily anchor | **Today** — a queue driven by what you committed to |
| Pattern decay | **Brain Cache** — spaced revision and smart re-queues |
| Prep without feedback | **Dashboard & Submissions** — progress, trends, and run history |

This repository is the **client application**: a production-grade React SPA that makes that system feel inevitable — not like another admin dashboard bolted onto a CRUD API.

---

## Frontend Engineering Highlights

This is not a tutorial UI with routes swapped in. The frontend is engineered as a **product surface** with deliberate UX systems.

### Immersive auth & first-run experience

- **Cinematic login** — canvas particle field, monospace code snippets, and a custom **scramble-text hero** that cycles engineering mantras with eased reveal/dissolve phases
- **OAuth flows** — Google and GitHub sign-in with completion paths for partial registrations and email verification
- **Guest vs protected routing** — route guards that keep auth state, server cache, and navigation coherent

### Dynamic product walkthrough

A **route-aware onboarding system** (`OnboardingWalkthrough`) guides new users across Explore → Schedules → Today → Brain Cache without leaving the real app:

- DOM-targeted spotlight holes via `data-onboarding` attributes
- Adaptive panel placement (auto / right / bottom / center)
- `scrollIntoView` for off-screen targets
- Framer Motion transitions with `prefers-reduced-motion` respect
- Persisted completion state synced to the user profile

### Schedule-driven UX

The interface is organized around **what is due today**, not around static pages. Today’s queue, overdue panels, due-calendar timeline, and schedule-grouped assignments share one mental model: *open the app → know exactly what to solve next*.

### Performance-first rendering

- **Route-level code splitting** — every major screen is lazy-loaded with a branded fallback
- **Manual Vite chunks** — Monaco, Framer Motion, MUI, TanStack Query, and React isolated to avoid main-thread monoliths
- **Virtualized problem catalogs** — `@tanstack/react-virtual` for large lists without layout thrash
- **Fixed page shells** — `FixedPageShell` + inner `ScrollRegion` so only sub-regions scroll; eliminates double-scroll jank
- **Fluent scroll system** — `useFluentScroll` toggles `is-scrolling` on scroll roots so CSS infinite animations pause during interaction (see `global.css` + `FLUENT_PAGE` classes)

### Component architecture

- **Pages** — route orchestration and data wiring
- **Components** — reusable UI primitives (`SectionCard`, `AppModal`, `StatsStrip`, stat rings, banners)
- **Modules** — feature-composed UI (schedule creation modal, topic preview, judge workspace)
- **Features** — cross-cutting domains (due calendar)
- **Services + hooks** — Axios API layer, React Query keys, infinite catalog hooks
- **Store** — Zustand for auth session and UI shell (sidebar collapse, etc.)

### State management sophistication

- **TanStack Query** owns server state — stale times, prefetch, invalidation prefixes across Brain Cache / calendar / learning progress
- **Zustand (persisted)** holds auth identity and lightweight UI preferences
- **React Hook Form + Zod** on auth and settings flows
- Query invalidation is **domain-scoped** (`brainCacheKeyPrefix`, `dueCalendarDayPrefix`, etc.) so mutations do not blanket-refetch the app

### Motion & interaction systems

- Framer Motion for onboarding overlays, modals, and enter/exit choreography
- CSS animation layers (`animations.css`, `auth-experience.css`, `login.css`) separated from component logic
- Micro-interactions: solve-button ripple, animated stat cards, progress rings, week belt on dashboard
- Ambient background layer in the app shell for depth without clutter

### Responsive system design

- Collapsible sidebar with icon-only mode and tooltips
- Mobile-aware onboarding panel fallbacks
- MUI breakpoints for auth layouts and dense data views
- Touch-friendly nav drawer on smaller viewports

---

## Design Philosophy

CodeZero intentionally avoids the look of a generic SaaS dashboard: heavy sidebars, rainbow stat cards, and template admin chrome.

The visual language follows **tool-grade minimalism** — the kind of density and restraint seen in products like **Linear**, **Raycast**, **Vercel**, and **Cursor**:

- **Metal Slate** dark palette — charcoal bases, steel accents, surgical orange brand moments
- **Typography hierarchy** — Space Grotesk, Syne, Inter, JetBrains Mono, Fira Code
- **Glass-adjacent surfaces** — subtle borders, soft elevation, no noisy gradients
- **Information density without clutter** — mono stat strips, section cards, inline hero metrics
- **Motion with purpose** — animation signals state change; it does not decorate empty screens

The goal: feel like a **professional engineer’s daily tool**, not a student project wrapped in Material UI defaults.

---

## Feature Breakdown

### Explore (`/templates`)

The activation surface. Browse **Daily POTD**, **Study Plans**, and **Topic** templates, filter by type, preview curricula in a topic modal, and enroll into **My Schedules**. Deep-link preview via `?preview=` keeps sharing and onboarding flows seamless.

**User loop:** discover → preview problems → enroll → practice appears in Today.

### My Schedules (`/schedules`)

Your active training roster. See enrolled streams, manage lifecycle (pause/resume), and understand what feeds the daily engine. Schedule cards expose type, progress context, and navigation into Today.

**User loop:** maintain the set of commitments that generate tomorrow’s queue.

### Today (`/today`)

The daily command center.

- **Queue tab** — pending assignments grouped by schedule, POTD hero, progress strip, overdue callouts
- **Timeline tab** — due calendar with day drill-down for historical and forward visibility

**User loop:** open app → clear queue → build streak → handle overdue honestly.

### Brain Cache (`/brain-cache`)

Retention layer for problems that must stay sharp.

- **Playlists** — curate high-value problems into revision sets
- **Today / overdue revision rows** — what needs revisiting now
- **Smart Revisions** — auto-generated revision suggestions from solve history
- Analytics hero for revision health

**User loop:** solve → pin to cache → spaced reps prevent pattern decay.

### Study Plans & Topics (within Explore)

Structured paths and topic streams. Study plans advance in order; topics cluster by theme. Enrollment turns structure into **daily assignments** without manual problem picking.

### Social Auth

Email/password plus **Google OAuth** and **GitHub OAuth**, with flows for verify-email, forgot/reset password, OAuth profile completion, and callback handling. Auth errors use transient visibility patterns so failures feel crisp, not sticky.

### Walkthrough System

Eight-step guided tour across real routes and real components — not a slideshow modal. Teaches the product loop: *Explore → schedule → Today → Brain Cache → supporting modules*.

### Problem Tracking & Judge Workspace (`/problems/:slug`)

Full problem detail with description, constraints, and a **Monaco-based judge workspace**:

- Resizable panels (`react-resizable-panels`)
- Multi-language compiler support
- Submission status, test results, formatting (Prettier + Java plugin)
- Solve timer and progress invalidation back into Today / Dashboard / Brain Cache

### Daily Practice Engine

Schedules + server-side assignment logic (consumed by the client) produce **tracked assignments** with statuses, due dates, and schedule types (`DAILY_POTD`, `STUDY_PLAN`, `TOPIC`). The frontend renders that engine as Today’s queue, overdue panels, and dashboard summaries.

### Lab (`/lab`)

Sandbox environment for experimentation outside the daily queue.

### Submissions (`/submissions`)

Run history, difficulty breakdowns, activity heatmap, and solved progress analytics.

### Community (`/community`)

Forum hub — browse, create posts, threaded comments, emoji picker — social layer around the solo practice loop.

### Dashboard (`/dashboard`)

Operational overview: learning trend chart, solve progress ring, week belt, compact today/overdue/brain-cache rows, leaderboard, shuffled problem catalog discovery, and quick navigation into the daily loop.

---

## Technical Depth

### Scalability mindset

- Feature folders scale by **domain** (brain cache, due calendar, explore modals) without coupling pages to giant monolith components
- API access is centralized in `services/` with typed responses
- `queryKeys` factory prevents cache key drift as endpoints grow
- Lazy routes keep initial bundle lean as features accumulate

### Maintainability

- TypeScript throughout — API types, compiler types, judge types, brain cache types
- Router extracted to `AppRouter` for testability; providers isolated in `App.tsx`
- Error boundary at shell level
- Consistent theme tokens (`miui`, `glassSx`, `sectionCardSx`) instead of one-off inline magic numbers

### Reusable systems

| System | Role |
|--------|------|
| `FixedPageShell` / `ScrollRegion` | Predictable scroll ownership |
| `FLUENT_PAGE` + `useFluentScroll` | Scroll-performance contract |
| `queryKeys` + invalidation prefixes | Coherent cache updates |
| `OnboardingProvider` + store | Product education without third-party tour widgets |
| `ProblemCatalogVirtualTable` | Large-list performance |
| `ProblemJudgeWorkspace` | Editor + judge UX in one module |

### UX-driven engineering

Technical choices follow user-perceived latency:

- Prefetch catalog on dashboard mount
- `staleTime` tuned per screen (Today vs Brain Cache)
- Suspense fallbacks that match brand instead of blank flashes
- Reduced-motion branches in motion-heavy components

---

## Performance Engineering

Early iterations of dense pages suffered from **scroll jank** and **animation contention** (infinite CSS loops fighting scroll handlers). The client was refactored around measurable interaction quality:

1. **Scroll root isolation** — pages do not scroll the document; inner regions do
2. **Fluent scroll pausing** — decorative animations halt while `is-scrolling` is active
3. **Virtualization** — problem catalogs render visible rows only
4. **Code splitting** — Monaco and motion load only when routes need them
5. **Chunk strategy** — vendor separation in `vite.config.ts` for cache-friendly deploys
6. **Passive scroll listeners** — no main-thread blocking on scroll start

Result: transitions feel **continuous**, lists stay **responsive**, and the app remains usable on mid-tier hardware — the bar for a daily-use developer tool.

---

## Animations & Motion

| Surface | Behavior |
|---------|----------|
| Login hero | Character scramble with phased reveal / hold / dissolve |
| Auth canvas | Particle field behind credential panel |
| Onboarding | Spotlight dim + animated step panel via portal |
| Modals | `AppModal` + motion presets |
| Dashboard | Animated banners, stat pulses for overdue emphasis |
| Cards | `FadeInCard`, `MotionFadeIn`, `AnimatedStatCard` |
| Global | `animations.css` keyframes coordinated with scroll state |

All motion paths consider **`prefers-reduced-motion`** — accessibility is part of the motion system, not an afterthought.

---

## Tech Stack

Technologies were chosen for **velocity, type safety, and control** over the UX — not resume-driven stacking.

| Layer | Choice | Why |
|-------|--------|-----|
| Runtime | **React 19** | Modern concurrent-ready UI with a mature ecosystem |
| Build | **Vite 5** | Fast HMR, explicit chunk control, simple API proxy for dev |
| Language | **TypeScript** | Contract safety across services, stores, and forms |
| UI | **MUI 9 + Emotion** | Accessible primitives with full theme override for a custom design system |
| Server state | **TanStack Query 5** | Cache orchestration, prefetch, mutations, infinite queries |
| Client state | **Zustand** | Minimal persisted auth/session without Redux ceremony |
| Routing | **React Router 7** | Nested layouts, guards, lazy routes |
| Forms | **React Hook Form + Zod** | Performant validation on auth/settings |
| Motion | **Framer Motion 12** | Layout-aware onboarding and modal transitions |
| Lists | **TanStack Virtual** | Catalog performance at scale |
| Editor | **Monaco** | IDE-grade solving experience |
| HTTP | **Axios** | Interceptors and typed service modules |
| Dates | **Day.js** | Lightweight scheduling and calendar labels |

---

## Screenshots

> Add assets under `docs/screenshots/` and replace placeholders below.

### Authentication

<!-- ![Auth — login with scramble hero and OAuth](docs/screenshots/auth-login.png) -->
`docs/screenshots/auth-login.png` — *Login: particle canvas, scramble hero, Google/GitHub OAuth*

### Onboarding walkthrough

<!-- ![Onboarding spotlight on Explore](docs/screenshots/onboarding-explore.png) -->
`docs/screenshots/onboarding-explore.png` — *Route-aware spotlight tour on Explore*

### Explore

<!-- ![Explore templates and enroll CTAs](docs/screenshots/explore-templates.png) -->
`docs/screenshots/explore-templates.png` — *Topic / plan catalog with enroll actions*

### My Schedules

<!-- ![Active schedules roster](docs/screenshots/schedules-roster.png) -->
`docs/screenshots/schedules-roster.png` — *Enrolled training streams*

### Today

<!-- ![Today queue and progress](docs/screenshots/today-queue.png) -->
`docs/screenshots/today-queue.png` — *Daily queue, POTD hero, overdue panel*

### Dashboard

<!-- ![Dashboard insights overview](docs/screenshots/dashboard-overview.png) -->
`docs/screenshots/dashboard-overview.png` — *Trends, progress ring, week belt, leaderboard*

### Brain Cache

<!-- ![Brain Cache revisions](docs/screenshots/brain-cache.png) -->
`docs/screenshots/brain-cache.png` — *Playlists and spaced revision*

### Problem judge workspace

<!-- ![Monaco judge workspace](docs/screenshots/problem-judge.png) -->
`docs/screenshots/problem-judge.png` — *Resizable editor, tests, submission feedback*

---

## Why This Project Stands Out

Recruiters see hundreds of **todo apps**, **weather dashboards**, and **LeetCode clones** with a single list page and no product story.

CodeZero is different because the frontend encodes **system thinking**:

| Typical portfolio app | CodeZero frontend |
|----------------------|-------------------|
| Static pages | **Schedule-driven** daily loop |
| One-off forms | **Multi-path auth** + OAuth completion flows |
| Generic MUI layout | **Custom design system** (Metal Slate, tool-grade density) |
| No onboarding | **In-app walkthrough** tied to real routes and DOM targets |
| List + detail only | **Today, overdue, calendar, revision** as first-class surfaces |
| Ignore performance | **Virtualized catalogs**, fluent scroll, manual chunks |
| CRUD demo | **Judge workspace**, submissions analytics, community layer |

The depth is in **how practice is structured**, not in how many buttons exist. That is product architecture expressed through frontend engineering.

---

## Developer Experience

```text
src/
├── app/              # Root providers
├── routes/           # Router, guards, lazy page map
├── pages/            # Route-level screens
├── components/       # Shared UI
├── modules/          # Feature-composed UI (schedules, explore, judge)
├── features/         # Domain slices (due calendar)
├── onboarding/       # Walkthrough system
├── services/         # API clients
├── hooks/            # Query + UI hooks
├── store/            # Zustand stores
├── theme/            # MUI theme + scroll contracts
├── styles/           # Global CSS layers
└── types/            # Shared TypeScript contracts
```

**Quality signals in the codebase:**

- Strict TypeScript project references (`tsc -b` on build)
- ESLint + React hooks rules
- Path alias `@/` for readable imports
- Documented architectural intent in key files (App shell, auth store, scroll hooks)
- Query key factory to prevent cache collisions as the API grows

The codebase is structured so a new engineer can add a **feature module** without rewiring the entire app — the same standard expected in a growing startup frontend.

---

## Run Locally

The UI expects the CodeZero API (and compiler worker when using judge features). From the **monorepo root** that hosts the backend:

```bash
# Terminal 0 — Redis (once)
docker compose -f docker-compose.compiler.yml up -d

# Terminal 1 — API
npm run dev

# Terminal 2 — compiler worker
npm run compiler:worker
```

From **this frontend package**:

```bash
npm install
npm run dev
```

Open **http://localhost:5173** — dev requests proxy to `http://localhost:2026` via Vite (`/api`).

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | `tsc -b` + production bundle |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

### Environment

Copy `.env.example` to `.env` when deploying against a non-local API:

```env
VITE_API_BASE_URL=https://your-api.example.com
```

Leave empty in development to use the Vite `/api` proxy.

---

## Future Vision

The current client already models the core loop. Natural evolution paths:

- **AI-assisted practice** — hints, complexity feedback, and weakness targeting in the judge workspace
- **Adaptive schedules** — frontend surfaces that reflect dynamic difficulty pacing from solve telemetry
- **Interview intelligence** — pattern mastery maps and mock-interview readiness views on Dashboard
- **Personalized revision** — Brain Cache smart tabs driven by retention models, not static intervals alone

The architecture (query-key domains, feature modules, lazy routes) is built to absorb those surfaces without a rewrite.

---

<div align="center">

**CodeZero** — structure your reps. Protect your patterns. Ship interview confidence as a habit.

*Built with intent. Engineered for daily use.*

</div>
