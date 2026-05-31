# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server on 0.0.0.0:5173
npm run build            # Generate sitemap, type-check, then build for production
npm run preview          # Preview production build
npm run test:e2e         # Run Playwright E2E tests (dev server auto-starts)
npm run generate:sitemap # Generate sitemap.xml from tools.json
```

## Architecture

This is **ORZ2** — a commercial online-tools platform built with **React 18 + Vite 6 + TypeScript**. It serves as both a tools directory and a customizable product showcase. The site is purely static (no backend), with all content driven by JSON data files.

### Stack

- **React 18** with `react-router-dom` v6 for routing
- **GSAP** + ScrollTrigger for scroll animations, card tilt effects, and video crossfading
- **react-helmet-async** for per-page SEO (Open Graph, Twitter cards, JSON-LD structured data)
- **Lucide React** for icons
- **Playwright** for E2E tests
- Single CSS file at `src/styles.css` — no CSS modules or CSS-in-JS

### Entry & Routing

`src/main.tsx` wraps the app in `HelmetProvider` → `BrowserRouter` → `AuthProvider` → `App`.

`src/App.tsx` defines routes inside a `LayoutApp` (Header + Outlet + Footer):
- `/` — `PageHome` (hero rotator, compact product grid, testimonials, contact)
- `/products` — `PageProducts` (full product directory with search/category filter)
- `/team` — `PageTeam`
- `/privacy` — `PagePrivacy`
- `/tools/:slug` — `PageTool` (dynamic tool detail; `/tools/wechat-auto-publisher` renders a dedicated form page)

### Data Layer

All content lives in `src/config/`:
- `tools.json` — array of `ProductTool` objects (name, slug, category, description, tags, SEO fields)
- `site.ts` — hero media URLs, testimonials, team members, product categories (derived from tools.json)
- `seo.ts` — per-page SEO configs and auto-generated per-tool SEO configs with JSON-LD

Types are defined in `src/types.ts`.

### Auth System (`src/components/ContextAuth/index.tsx`)

Mock authentication using React Context + localStorage. Provides `useAuth()` hook with `isAuthenticated`, `user`, `login()`, `logout()`, and `withLoginRequired` (a higher-order gate that triggers the login modal before executing a gated action). The WeChat publisher page uses `useLoginGate()` to gate the "generate" button.

### Key Components

- **`EffectsMotion`** — a renderless component mounted once in `<App />` that registers all GSAP animations: header shrink-on-scroll, intro reveals, scroll-triggered batch reveals, card tilt on pointer move, and a MutationObserver for dynamic content. Respects `prefers-reduced-motion`.
- **`Seo`** — sets `<title>`, meta tags, canonical link, and JSON-LD via Helmet + direct DOM manipulation for dynamic updates.
- **`SectionProduct`** — dual-mode: `compact` (homepage, local state, shows 3 tools) or full (products page, URL search params).
- **`SectionHeroVideo`** — crossfading video layers with random rotation and reduced-motion fallback (static poster).
- **`SectionTestimonial`** — danmaku-style floating testimonials using GSAP timelines, with balanced top/bottom distribution.

### Naming Convention

Components and pages use **noun-first PascalCase** and live in folders with `index.tsx`:
- Pages: `PageHome`, `PageProducts`, `PageTeam`, `PagePrivacy`, `PageTool`, `PageWechatPublisher`
- Components: `LayoutApp`, `ContextAuth`, `Seo`, `SectionContact`, `Footer`, `Header`, `SectionHeroVideo`, `SectionProduct`, `SectionTestimonial`, `EffectsMotion`

### WeChat Publisher Page (`src/pages/PageWechatPublisher/index.tsx`)

The most complex page — a multi-section form for configuring WeChat article publishing. Key behaviors:
- Form state persisted to `localStorage` under key `orz2:wechat-auto-publisher-form`
- JSON import/export of the full form config
- Completion progress indicator (x/4 sections)
- Login-gated "generate" action via `withLoginRequired`
- Form validation with inline error display
- The `normalizeForm()` function sanitizes data on load/import

### Styling Conventions

- CSS custom properties defined in `:root` for the color palette (`--green`, `--ink`, `--muted`, `--soft`, `--line`, etc.)
- `.interactive` class applied to all clickable elements for consistent transitions and focus-visible styles
- Responsive breakpoints at 960px, 640px, and 480px
- `prefers-reduced-motion` media query disables all animations

### Build Output

The `dist/` directory is the production output. `public/` contains static assets served at root: `sitemap.xml`, `robots.txt`, and `assets/wechat-console-guide.svg`. The sitemap is regenerated during each build via `scripts/generate-sitemap.mjs`.
