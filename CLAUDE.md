# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Vite dev server on 0.0.0.0 (default port 5173)
npm run start:local      # Dev mode using .env.dev
npm run start:uat        # Dev mode using .env.uat
npm run start:prod       # Dev mode using .env.prod
npm run build            # Clean → generate sitemap → tsc -b → vite build (default mode)
npm run build:local      # Build with .env.dev (sitemap generated for dev)
npm run build:uat        # Build with .env.uat
npm run build:prod       # Build with .env.prod
npm run preview          # Preview the production build
npm run test:e2e         # Playwright E2E tests (dev server auto-starts)
npm run generate:sitemap # Regenerate public/sitemap.xml from products/tools
npm run lint             # ESLint --fix on src
npm run format           # ESLint --fix + Prettier write on src
```

## Debugging with the Production Environment

当需要排查线上问题、复现仅在 `prod` 环境出现的行为（API 域名、鉴权、CDN、第三方脚本等）时，不要直接改代码或重新 `build`，而是用 dev server 加载 `.env.prod`：

```bash
npm run start:prod       # 走 .env.prod 的环境变量，但由 Vite dev server 提供热更新
```

要点：

- `start:prod` 复用 `npm run dev` 的 Vite dev server，**不**会生成 `dist/`，也不需要 `build:prod`，省去一次完整打包。
- 调试完切回常规开发请改用 `npm run dev`（默认 mode），避免误把 prod 配置带进日常迭代。
- 真正需要验证构建产物（资源路径、压缩、SRI、CDN 缓存策略）时再跑 `npm run build:prod && npm run preview`，而不是 `start:prod`。
- 切换环境时如遇 `.env.*` 变更未生效，先停掉 dev server 再重启；Vite 不会在运行期重新加载 `.env.*`。

## Architecture

This is **ORZ2** — a commercial online-tools platform built with **React 18 + Vite 6 + TypeScript**. It serves as both a tools directory and a customizable product showcase. The site is purely static (no backend), with all content driven by JSON data files plus per-locale dictionaries.

### Stack

- **React 18** + **Vite 6** + **TypeScript 5.7**
- **react-router-dom v6** with the v7 future flags (`v7_relativeSplatPath`, `v7_startTransition`)
- **GSAP 3** + **ScrollTrigger** + **@gsap/react** for scroll, intro, and hover animations
- **react-helmet-async** for per-page SEO (Open Graph, Twitter, JSON-LD)
- **Tailwind CSS v4** via `@tailwindcss/vite` (no `tailwind.config.js`; tokens live in `@theme` inside `src/styles/theme.css`)
- **lucide-react** for icons
- **axios** + **dayjs** + **blueimp-md5** + **qrcode.react** + **uuid** for the WeChat publisher / auth flow
- **Playwright** for E2E tests
- Path alias `@/*` → `src/*`

### Entry & Providers (`src/main.tsx`)

`main.tsx` wraps the app in `ThemeProvider` → `HelmetProvider` → `BrowserRouter` → `I18nProvider` → `AuthProvider` → `App`. The first paint is optimized by an inline script in `index.html` that reads `orz2:theme-preference` from `localStorage` and applies `data-theme` before React boots, preventing a flash of incorrect theme.

### Routing (`src/routes/index.tsx`)

Routes are constructed in three locale branches (`/`, `/en`, `/ja`) plus a catch-all `:locale/*` redirect that strips unknown locale prefixes. Inside each branch, `LayoutApp` hosts the children:

- `/` — `PageHome` (hero rotator, tools, products, testimonials, contact)
- `/products` — `PageProducts` index, plus `ProductSilicon` sub-routes (`/products/silicon`)
- `/tools` — `PageTools` index, plus `ToolOfficialPublisher` sub-routes (`/tools/official-publisher`)
- `/team` — `PageTeam`
- `/privacy` — `PagePrivacy`
- `/design-system` — `PageDesignSystem` (internal component gallery)

All non-home pages are lazy-loaded with `React.lazy` and rendered through `useRoutes` in `App.tsx`, which also mounts the `EffectsMotion` listener once. `I18nProvider` syncs `<html lang>` and writes the active locale to `localStorage` whenever the URL prefix changes.

### Data Layer (`src/config/` + `src/i18n/catalog.ts`)

Static content lives under `src/config/`:

- `index.ts` — exports `siteConfig` (contact email, etc.)
- `products.json` / `tools.json` — arrays of `CatalogItem` (the unified model for both products and tools; originally split from `tools.json` to introduce `products.json`)
- `site.ts` — `heroMedia`, `testimonials`, `teamMembers`, `toolCategories`, `productGroups`, `toolGroups`, and Chinese-only site copy (`homeSections`, `footerCopy`, `loginCopy`, `headerCopy`, `pageTitles`)
- `seo.ts` — per-locale page SEO configs and per-tool SEO configs with JSON-LD
- `catalog-stages.ts` — the `LIVE` / `BETA` / `PLANNING` enum is stored upper-case in JSON; this file owns the rendered label/tone and the `catalog-card-stage--{tone}` class names

Catalog content is **localized** in `src/i18n/catalog.ts`: it exports `getTools(locale)` and `getProducts(locale)`, applying `groupTranslations` (en/ja) plus per-item translations (name, summary, badges, entries, SEO). Use these accessors in components — do not read `tools.json` / `products.json` directly through `@/config` in render code.

All shared types live in `src/types.ts` (`CatalogItem`, `CatalogGroup`, `CatalogStage`, `CatalogPlatform`, `CatalogMedia`, `CatalogEntry`, `HeroMedia`, `TeamMember`, `Testimonial`, `SeoConfig`).

### i18n (`src/i18n/`)

A custom lightweight i18n setup (no `react-intl`/`i18next`) with three locales:

| Locale  | URL prefix | `<html lang>` | OpenGraph |
| ------- | ---------- | ------------- | --------- |
| zh-CN   | (none)     | `zh-CN`       | `zh_CN`   |
| en      | `/en`      | `en`          | `en_US`   |
| ja      | `/ja`      | `ja`          | `ja_JP`   |

- `locales/{zh-CN,en,ja}.ts` export `messages` objects shaped as `messages.{pageTitles,header,footer,home,login,seo,catalogStages,...}`. Each locale is roughly 25–32 KB; add a new key to all three files when extending.
- `index.tsx` exposes the `I18nProvider`, the `useI18n()` hook (`locale`, `localeName`, `locales`, `messages`, `localizePath`, `switchLocale`), and helpers: `parseLocalizedPath`, `stripLocalePrefix`, `localizePath`, `switchLocaleInPath`, `isPrefixedLocalePath`, `isInvalidLocaleLikePrefix`.
- The persisted key is `orz2:locale` (set on every locale change).
- Components render text via `const { messages } = useI18n(); messages.foo.bar` — do not hard-code English or Chinese strings inside components.

### Theme (`src/theme/index.tsx`)

A `ThemeProvider` with three user preferences: `system` (default), `light`, `dark`. It writes `document.documentElement.dataset.theme`, sets `color-scheme`, updates `<meta name="theme-color">`, persists to `orz2:theme-preference` in `localStorage`, and listens to `prefers-color-scheme` changes when preference is `system`. The hook `useTheme()` returns `{ preference, resolvedTheme, setPreference, cycleTheme }`. Tokens are defined in `src/styles/theme.css` under `@theme` for light defaults, with overrides under `[data-theme="dark"]` in the same file.

### Auth System (`src/components/ContextAuth/`)

Mock authentication using React Context + `localStorage`. `useAuth()` exposes `isAuthenticated`, `user`, `login()`, `logout()`, `withLoginRequired` (higher-order gate that opens the login modal before running a gated action), and `openLogin()` (manual trigger used by Header). The WeChat publisher page uses `useLoginGate()` to wrap the "generate" button. Login copy lives in `site.ts` (`loginCopy`); the modal renders a `qrcode.react` "太阳码" with auto-refresh on expiry, and now uses a `third` channel identifier for the mini-program scan flow.

### Design System (`src/components/O*/`)

The `O*` family is the project's own design system. New UI should reach for these first; only drop down to raw elements when nothing fits.

- `OButton` — primary/secondary/ghost variants
- `OIconButton` — square icon-only button used in Header (locale/theme menus, mobile nav)
- `OBadge` — small label / status pill
- `OCard` — base card surface
- `OCardCatalog` — the catalog card used by tools & products, renders lifecycle stage + entries
- `OEmptyState` — empty list placeholder
- `OModal` — generic modal/dialog primitive
- `OPageHero` — page-level hero with title/description/actions
- `ORadio` — radio group (used by Header for theme preference)
- `OSectionHeading` — section title + subtitle
- `OSelector` — segmented selector (used for category filters)
- `OTab` — tab control
- `OTooltip` — accessible tooltip (used in publisher config hints)

### Other Key Components

- **`EffectsMotion`** (`src/components/EffectsMotion/`) — renderless, mounted once in `App`. Registers header shrink-on-scroll, intro reveals, scroll-triggered batch reveals, card tilt on pointer move, and a `MutationObserver` that re-applies reveals when the DOM changes. Respects `prefers-reduced-motion`.
- **`Seo`** (`src/components/Seo/`) — sets `<title>`, meta tags, canonical link, and JSON-LD via `react-helmet-async` plus direct DOM mutations for dynamic updates.
- **`SectionProducts` / `SectionTools`** — replaced the old single `SectionProduct`. Both consume `getProducts` / `getTools` and drive search + group filter via URL search params; the homepage renders them in "compact" mode showing 3 items.
- **`SectionHero`** — crossfading video/poster layers with random rotation, reduced-motion fallback, and a no-op stub when video fails. Replaces the older `SectionHeroVideo`.
- **`SectionTestimonial`** — danmaku-style floating testimonials using GSAP timelines with balanced top/bottom distribution.
- **`LayoutApp`** — Header + `<Outlet />` + Footer. Also handles scroll-to-top on route change.

### Naming Convention

Components and pages use **noun-first PascalCase** and live in folders with `index.tsx` (and `index.css` for local styles):

- Pages: `PageHome`, `PageProducts`, `PageTeam`, `PagePrivacy`, `PageTools`, `PageDesignSystem`, plus `Products/ProductSilicon` and `Tools/ToolOfficialPublisher` for sub-products
- Components: `LayoutApp`, `ContextAuth`, `Seo`, `SectionContact`, `Footer`, `Header`, `SectionHero`, `SectionProducts`, `SectionTools`, `SectionTestimonial`, `EffectsMotion`
- Design system: every component in `O*` folders

### WeChat Publisher (`src/pages/Tools/ToolOfficialPublisher/`)

The most complex page — a multi-section form for configuring WeChat article publishing. The previous standalone `PageWechatPublisher` is now mounted at `/tools/official-publisher` as part of the tools section. Key behaviors:

- Form state persisted to `localStorage` under key `orz2:official-publisher-form`
- JSON import/export of the full form config
- Completion progress indicator (x/4 sections)
- Login-gated "generate" action via `withLoginRequired`
- Form validation with inline error display
- `normalizeForm()` sanitizes data on load/import
- Streaming `postOfficialPublisher` / `streamPostOfficialPublisher` from `src/api/orz2.ts` drive progress events

### Styling Conventions

- Tailwind v4 with the `@theme` directive in `src/styles/theme.css` — semantic color tokens (`--color-green`, `--color-ink`, `--color-muted`, `--color-soft`, `--color-line`, `--color-panel`, danger/gold, etc.) are defined once and consumed via `bg-green`, `text-ink`, etc.
- Dark mode overrides are declared in the same file under `[data-theme="dark"]`
- Component-local tweaks live next to each component in `index.css`
- `.interactive` class is applied to all clickable elements for consistent transitions and `:focus-visible` styles
- Responsive breakpoints at 960px, 640px, 480px (defined in `src/styles/common.css`)
- `prefers-reduced-motion` media query disables all GSAP animations

### API Surface (`src/api/`)

`src/api/index.ts` re-exports everything from `./orz2` and `./orz2.modal`. The `Orz2` namespace is the canonical entry; named functions (`postOfficialPublisher`, `streamPostOfficialPublisher`, etc.) are also exported. Types live alongside in `orz2.modal.ts`. Shared utilities: `CacheManager` (TTL-aware localStorage cache), `FetchManager` (axios wrapper), `motion.ts`, `utils.ts`.

### Build Output & Static Assets

The `dist/` directory is the production output. `public/` holds static assets served at root: `sitemap.xml` (regenerated every build via `scripts/generate-sitemap.mjs` against the current `products.json` / `tools.json`), `robots.txt`, and SVG/PNG guides. Mode-specific builds (`build:dev` / `build:uat` / `build:prod`) pick the matching `.env.*` file and forward the mode flag to the sitemap generator so the generated sitemap matches the deployed host.
