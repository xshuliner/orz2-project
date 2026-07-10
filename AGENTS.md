# AGENTS.md

This file provides guidance for coding agents working in this repository.

## Commands

This project is pinned to `pnpm@10.34.3` in `package.json`. Prefer `pnpm`
commands when installing or running scripts.

```bash
pnpm run dev              # Vite dev server on 0.0.0.0, default port 5173
pnpm run start:local      # Dev server using .env.dev
pnpm run start:uat        # Dev server using .env.uat
pnpm run start:prod       # Dev server using .env.prod
pnpm run clean            # Remove dist/
pnpm run generate:sitemap # Regenerate public/sitemap.xml from static pages + internal tool entries
pnpm run build            # clean -> sitemap(prod) -> xbi generate -> tsc -b -> vite build
pnpm run build:local      # Build with .env.dev and local build-info metadata
pnpm run build:uat        # Build with .env.uat, base /uat/, deploy URL https://orz2.online/uat
pnpm run build:prod       # Build with .env.prod, deploy URL https://orz2.online
pnpm run preview          # Preview the production build
pnpm run test:e2e         # Playwright smoke tests; webServer starts the dev server
pnpm run lint             # ESLint --fix on src
pnpm run format           # ESLint --fix + Prettier write on src
```

`playwright.config.ts` currently uses `http://localhost:5173` and starts
`npm run dev -- --port 5173` as its web server command, so keep that config in
sync if the dev command changes.

## Debugging With The Production Environment

当需要排查线上问题、复现仅在 `prod`
环境出现的行为（API 域名、鉴权、CDN、第三方脚本等）时，优先用 dev server 加载
`.env.prod`，不要先改代码或重新打完整包：

```bash
pnpm run start:prod
```

要点：

- `start:prod` 复用 Vite dev server，加载 `.env.prod`，不会生成 `dist/`。
- 调试完切回常规开发请改用 `pnpm run dev`，避免把 prod 配置带入日常迭代。
- 只有需要验证构建产物、资源路径、压缩、base
  path、build-info 或 CDN 行为时，才运行
  `pnpm run build:prod && pnpm run preview`。
- `.env.*` 变更后需要重启 dev server；Vite 不会在运行中重新加载 env 文件。

## Architecture

**ORZ2** is a commercial online-tools and product-showcase frontend built with
**React 18 + Vite 6 + TypeScript**. The repository ships a static frontend;
there is no in-repo backend. Runtime features such as login, Silicon member
data, content polishing, WeChat publishing, and TinyPNG compression call remote
ORZ2 APIs from `src/api/orz2.ts`.

### Directory Ownership & Placement Rules

Keep ownership clear: code should live where future maintainers would first look
for it. Do not dump unrelated concerns into a convenient file, and do not split
a small cohesive feature just to create more folders.

| Path                                      | Owns                                                                                                  | Do not put here                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/main.tsx`                            | React root, provider order, router basename, global CSS import                                        | App routes, page logic, feature state, data transforms                                 |
| `src/App.tsx`                             | One-time app shell concerns such as global effects and `useRoutes(routes)`                            | Route definitions, providers, page-specific loading UI                                 |
| `src/routes/`                             | Top-level locale-aware route tree and lazy route composition                                          | Page implementation, tool/product business logic, SEO config                           |
| `src/api/`                                | Remote ORZ2 API functions and API request/response types                                              | UI state, localStorage form state, page formatting helpers                             |
| `src/config/`                             | Static site/catalog/SEO configuration and source data shared across pages                             | React hooks, DOM reads/writes, runtime state, computed UI behavior                     |
| `src/i18n/`                               | Locale metadata, locale dictionaries, path localization, message access, localized catalog projection | Non-i18n config, general hooks, page-only copy, unrelated utilities                    |
| `src/hooks/`                              | Standalone reusable React hooks shared across pages/components                                        | Pure functions without React state/effects, page-only hooks                            |
| `src/theme/`                              | Theme provider, theme preference state, `useTheme()`                                                  | Component CSS tokens, page themes, unrelated app providers                             |
| `src/types/`                              | Shared TypeScript types for catalog, site, SEO, build-info                                            | Runtime helpers or feature logic unless they are tiny type-adjacent adapters           |
| `src/utils/`                              | Shared pure utilities and infrastructure helpers used by multiple areas                               | React hooks, JSX, page-only helper functions, static catalog data                      |
| `src/styles/`                             | Tailwind entry, global theme tokens, global base/common styles                                        | Component-specific CSS, product microsite CSS                                          |
| `src/components/`                         | Shared design-system, shell, SEO, auth, and reusable section components                               | Product/tool-specific UI that is only used by one module                               |
| `src/pages/`                              | Route page modules and feature implementations                                                        | Cross-page primitives that belong in `src/components`, global config, global utilities |
| `src/assets/`                             | Assets imported by source modules at build time                                                       | Root-served public files or generated build output                                     |
| `public/`                                 | Root-served static files, generated sitemap/build-info, public skill packages                         | Imported React source assets, editable app code                                        |
| `scripts/`                                | Node scripts for build-time generation/maintenance                                                    | Runtime browser code                                                                   |
| `tests/`                                  | Playwright E2E smoke tests                                                                            | Test artifacts or generated reports                                                    |
| `docs/`                                   | Human-facing project references such as UI/UX guidelines                                              | Source-of-truth runtime config                                                         |
| `dist/`, `test-results/`, `*.tsbuildinfo` | Generated output/artifacts                                                                            | Hand edits unless explicitly updating generated fixtures/output                        |
| `resource/`                               | Source/reference media outside the shipped app                                                        | Runtime app assets unless wired into `src` or `public` intentionally                   |

Placement rules:

- `src/i18n/index.tsx` should stay a thin compatibility barrel for i18n exports.
  Keep implementation in focused files such as `locale.ts`, `messages.ts`,
  `catalog.ts`, `context.tsx`, and `types.ts`. Do not add generic config, page
  state, API code, or unrelated helpers there.
- Standalone hook-style APIs belong in `src/hooks/`. Provider-coupled hooks may
  stay beside their provider until intentionally extracted. `useI18n()` lives in
  `src/hooks/useI18n.ts`; `src/i18n/index.tsx` re-exports it only for backward
  compatibility.
- Static data belongs in `src/config/` when shared globally. Feature-only static
  data belongs in that feature's local `config/` folder, for example
  `src/pages/Tools/ToolOfficialPublisher/config/`.
- Keep all user-visible copy, prompt templates, fallback messages, catalog
  labels, SEO text, and test selectors in `src/i18n/locales/{zh-CN,en,ja}.ts`.
  Shared components and pages should read copy through `messages`; do not
  hard-code Chinese, English, or Japanese strings in shared UI, config files,
  utility fallbacks, SVG text assets, or tests. The only intentional exception
  is the independent Silicon product microsite under
  `src/pages/Products/ProductSilicon/`.
- Pure transforms used in two or more modules belong in a named file under
  `src/utils/`, not in `src/utils/utils.ts`. Page-only transforms should stay
  beside the page in a local `utils/` folder or inside the page file if small.
- Page modules may use local `routes/`, `pages/`, `components/`, `config/`,
  `hooks/`, and `utils/` folders. Promote code to `src/components`, `src/hooks`,
  or `src/utils` only after it is genuinely shared.
- Route modules under feature folders should only define lazy route objects and
  paths. Put route UI in `pages/`, route wrappers in local `components/`, and
  route metadata/SEO in config/i18n as appropriate.
- `pages/Home/index.tsx` files can orchestrate a feature, but when they become
  hard to scan split by concern: reusable local JSX to `components/`, form
  defaults/templates to `config/`, local React state machines to `hooks/`, and
  pure parsing/formatting to `utils/`.
- Add abstractions only when they reduce real duplication or clarify ownership.
  A one-off helper can stay local; a second independent caller is usually the
  signal to promote it.

### Stack

- **React 18** + **Vite 6** + **TypeScript 5.7**
- **react-router-dom v6** with future flags `v7_relativeSplatPath` and
  `v7_startTransition`
- **Tailwind CSS v4** via `@tailwindcss/vite`; tokens live in
  `src/styles/theme.css`, not in `tailwind.config.js`
- **GSAP 3** + `ScrollTrigger` for reveal, header, tilt, and Silicon page motion
- **react-helmet-async** for SEO, canonical/alternate links, and JSON-LD
- **lucide-react** for icons
- **axios**, `FetchManager`, **blueimp-md5**, **uuid**, **dayjs**,
  **qrcode.react**, and **jszip** for APIs, signed requests, QR codes, date
  display, and image ZIP export
- **@xshuliner/build-info** (`xbi generate`) for static deployment metadata
- **Playwright** for E2E smoke tests
- Path alias `@/*` -> `src/*`

### Entry & Providers

`src/main.tsx` wraps the app in:

`ThemeProvider` -> `HelmetProvider` -> `BrowserRouter` -> `I18nProvider` ->
`AuthProvider` -> `App`

`BrowserRouter` derives its basename from `import.meta.env.BASE_URL`, which is
`/uat/` for UAT builds and `/` otherwise. `index.html` contains a first-paint
theme script that reads `orz2:theme-preference`, applies `data-theme`, updates
`color-scheme`, and loads `%BASE_URL%__xshuliner__/build-info.js` before React
boots.

`src/App.tsx` mounts `EffectsMotion` once, then renders `useRoutes(routes)` in a
`Suspense` boundary.

### Routing

Routes are built in `src/routes/index.tsx` for three locale branches:

| Locale  | Prefix | Notes          |
| ------- | ------ | -------------- |
| `zh-CN` | none   | default locale |
| `en`    | `/en`  | English        |
| `ja`    | `/ja`  | Japanese       |

Unknown locale-like prefixes are handled by the `:locale/*` catch-all redirect,
which strips the first path segment.

Inside each locale branch, `LayoutApp` renders `OHeader`, `<Outlet />`, and
`OFooter`, and forces scroll-to-top on route/search changes.

Current app routes:

- `/` -> `PageHome`
- `/products` -> `PageProducts`
- `/products/silicon` -> Silicon product home inside `ProductSiliconFrame`
- `/products/silicon/member-list` -> Silicon member list
- `/products/silicon/member-detail` -> Silicon member detail
- `/tools` -> `PageTools`
- `/tools/official-publisher` -> WeChat official-account publisher
- `/tools/smart-image-compressor` -> batch image studio / compressor
- `/tools/timezone-converter` -> time zone converter
- `/tools/work-report-polisher` -> daily / weekly report polisher
- `/team` -> `PageTeam`
- `/privacy` -> `PagePrivacy`
- `/design-system` -> internal component gallery, `robots: noindex, follow`
- `/build-info` -> deployment build metadata viewer, `robots: noindex, follow`

All non-home page modules and product/tool sub-routes are lazy-loaded.

### Data Layer

Static catalog and site data live in `src/config/`:

- `products.ts` and `tools.ts` store Chinese-free `CatalogBaseItem[]` source
  data: ids, group keys, media, lifecycle metadata, platform flags, entry URLs,
  and SEO slugs/static metadata only.
- `site.ts` exports `siteConfig` only.
- `seo.ts` builds per-locale page SEO and per-tool SEO from `getMessages()`,
  `getProducts()`, and `getTools()`.
- `catalog.ts` owns static catalog metadata such as `LIVE` / `BETA` / `PLANNING`
  tone classes only. Stage labels and descriptions live in locale messages.

Render code should consume localized catalog accessors from
`src/i18n/catalog.ts` or from the compatibility exports in `src/i18n/index.tsx`:

- `getTools(locale)`
- `getProducts(locale)`
- `getToolGroups(locale)`
- `getProductGroups(locale)`
- `getToolCategories(locale, allLabel)`
- `getHeroMedia(locale)`
- `getTestimonials(locale)`
- `getTeamMembers(locale)`

Do not read `tools.ts` or `products.ts` directly from UI components unless you
are intentionally bypassing localization.

When adding or editing catalog entries, keep `src/config/products.ts` and
`src/config/tools.ts` free of display strings. Add `name`, `summary`, `badges`,
`entries`, SEO text, and group labels to all three locale dictionaries. Missing
catalog or entry translations are treated as errors instead of falling back to
Chinese base data.

Shared catalog, site, SEO, and build-info types live in `src/types/`, including
`CatalogLifecycle`, `CatalogIconName`, `CatalogPlatform`, `CatalogMedia`,
`CatalogEntry`, `CatalogItem`, `CatalogGroup`, `HeroMedia`, `TeamMember`,
`Testimonial`, `SeoConfig`, and `XshulinerBuildInfo`.

### Catalog Behavior

`OCardCatalog` renders tool/product cards, lifecycle stage, platform chips,
badges, primary links, QR codes for H5/internal links, and WeChat sun-code
images. When `catalogType` is provided, opening a primary link or QR tooltip
records recent usage through `recordCatalogRecentUsage()`.

Recent usage is stored through `CacheManager` under `orz2:catalog-recent-usage`
and surfaced by:

- `src/hooks/useCatalogRecentUsage.ts`
- `src/utils/catalogRecentUsage.ts`
- `SectionCatalogRecent`

`SectionTools` and `SectionProducts` use URL search params `q` and `category` on
full listing pages. Their compact homepage mode merges recent items ahead of
items marked `compact: true`.

### i18n

The project uses a lightweight custom i18n layer, not `react-intl` or `i18next`.

| Locale  | URL prefix | `<html lang>` | OpenGraph |
| ------- | ---------- | ------------- | --------- |
| `zh-CN` | none       | `zh-CN`       | `zh_CN`   |
| `en`    | `/en`      | `en`          | `en_US`   |
| `ja`    | `/ja`      | `ja`          | `ja_JP`   |

`src/i18n/` is split by concern:

- `locale.ts` — locale metadata, path/localization helpers
- `messages.ts` — per-locale dictionaries; add new user-visible keys to all
  three locale files in `src/i18n/locales/{zh-CN,en,ja}.ts`
- `catalog.ts` — localized catalog accessors (`getTools`, `getProducts`, hero
  media, testimonials, team members)
- `context.tsx` — `I18nProvider`, which syncs `document.documentElement.lang`
  and persists the active locale to `orz2:locale`
- `types.ts` — i18n-related types
- `index.tsx` — thin compatibility barrel re-exporting all of the above plus
  `useI18n` from `src/hooks/useI18n.ts`

Components should read copy through `const { messages } = useI18n()` and never
hard-code Chinese, English, or Japanese strings in shared UI, feature configs,
API fallback errors, tests, or generated text templates. Use `localizePath()` or
internal-link components (`OButton` with `to`) for in-app routes, and
`toSiteUrl()` / `routeUrl()` for absolute canonical, alternate, and QR URLs. If
a feature needs LLM prompts or default generated content, keep those strings
under the feature's locale message branch and pass them into pure helpers.
Silicon product pages are intentionally exempt from this i18n requirement.

### Theme & Styling

`ThemeProvider` supports `system`, `light`, and `dark`. It persists
`orz2:theme-preference`, writes `document.documentElement.dataset.theme`, sets
`color-scheme`, updates `<meta name="theme-color">`, and listens to
`prefers-color-scheme` changes while in `system` mode.

CSS entry order is `src/styles/tailwind.css` -> `theme.css` -> `common.css`.

Important styling conventions:

- Tailwind v4 tokens live in `@theme` inside `src/styles/theme.css`.
- CSS custom properties for layout, spacing, text, controls, surfaces, shadows,
  z-index, and product-specific theme overrides also live in `theme.css`.
- Shared base styles and `.interactive` focus/hover behavior live in
  `src/styles/common.css`.
- Component-local CSS lives beside the component as `index.css`.
- Use the UI/UX reference at `docs/UI_UX_GUIDELINES.md` when adding new screens.
- `ProductSilicon` has an independent product theme via `.product-silicon-theme`
  and `.product-silicon-active`; do not flatten it into global ORZ2 styling.

### Design System

The `O*` component family is the house design system. New UI should use these
first:

- `OButton` -> button, router link, or anchor; internal `to` values are
  localized
- `OIconButton` -> square icon-only actions
- `OBadge` -> small labels and status pills
- `OCard` -> semantic surfaces with `tone`, `padding`, and optional
  `interactive`
- `OCardCatalog` -> catalog card for products and tools
- `OEmptyState` -> empty lists
- `OInputAI` -> input/textarea with AI polish/restore action via
  `postPolishContent`
- `OModal` -> portal dialog with Escape/backdrop close and focus restoration
- `OPageHero` -> page-level title/description/action layout
- `ORadio` -> segmented radio controls
- `OSectionHeading` -> section title + subtitle
- `OSelector` -> segmented selector
- `OTab` -> tab controls
- `OTooltip` -> accessible hover/click tooltip

`OHeader` and `OFooter` are also `O*` components. The older `Header`/`Footer`
names are not current.

### Key Components

- `EffectsMotion` lazy-loads `DeferredEffectsMotion` after idle/timeout. The
  deferred module handles header shrink-on-scroll, intro animation, scroll
  reveals, dynamic `MutationObserver` reveal registration, and pointer tilt for
  interactive cards. It respects `prefers-reduced-motion`.
- `Seo` sets title, description, robots, canonical, alternate locale links,
  OpenGraph/Twitter tags, and JSON-LD through `react-helmet-async`, with direct
  DOM meta updates for dynamic changes.
- `SectionHero` renders localized hero copy and a crossfading remote
  video/poster rotator with reduced-motion fallback and delayed video loading.
- `SectionTools` / `SectionProducts` render catalog directories, filters, recent
  usage, grouped cards, and homepage compact variants.
- `SectionTestimonial` is lazy-loaded from the homepage when near viewport.
- `SectionContact` still exists, but the current homepage does not mount it
  directly; contact actions are in `SectionHero`, `OFooter`, and privacy copy.

### Auth System

`src/components/ContextAuth/` provides React auth context and the shared login
modal. It is localStorage-backed, but not purely mock:

- Auth user cache: `orz2:auth-user`
- Token keys: `token`, `refreshToken`
- Login opens a QR-code modal, calls `postCreateMiniCodeLogin()`, polls
  `getQueryMiniCodeLogin({ uuid })`, then fetches `getQueryMemberInfo()`.
- `useAuth()` exposes `user`, `isAuthenticated`, `openLogin`, `closeLogin`,
  `logout`, and `withLoginRequired`.
- `useLoginGate()` returns `withLoginRequired` and is used by protected actions
  such as official-publisher generation.

`CacheManager` prefixes stored business keys with `CACHE_`; remember that
browser storage keys may not match the raw key string exactly.

### API Surface

`src/api/index.ts` re-exports the default `Orz2` namespace, named API functions,
and shared types from `orz2.modal.ts`.

`src/api/orz2.ts` contains:

- Mini-code login and member info APIs through `FetchManager`
- Silicon APIs: summary, member list/detail, story list, member login
- Tool APIs: `postTinifyImage`
- LLM polish API: `postPolishContent`
- Official publisher APIs: `postOfficialPublisher` and
  `streamPostOfficialPublisher`

`FetchManager` signs requests with `requestid`, `t`, and `k`, reads `token` from
`CacheManager`, and resolves its base URL from `VITE_API_BASE_URL` or fallback
env mappings.

Current env files:

- `.env.dev` -> local API at `http://localhost:9002/apilocal/smart/v1`
- `.env.uat` -> `https://orz2.online/apiuat/smart/v1`, site `/uat`
- `.env.prod` -> `https://orz2.online/api/smart/v1`

### Product: Silicon

`src/pages/Products/ProductSilicon/` is a product microsite under
`/products/silicon`. It uses `ProductSiliconFrame`, independent visual theme
tokens, custom GSAP motion, and hides the global `.site-header` on the Silicon
home page.

Key pieces:

- Home: member summary, nickname generation, "descend" flow, story feed polling,
  and skill-copy CTA
- Member list: paginated/infinite list with `IntersectionObserver`
- Member detail: token/id lookup, story and profile display
- Local member token key: `orz2_silicon_member_token`
- Public skill package: `public/skills/orz2-skill/`

### Tool: Official Publisher

`src/pages/Tools/ToolOfficialPublisher/` powers `/tools/official-publisher`.

Key behaviors:

- Form state persists to `orz2:official-publisher-form`
- Supports create and rewrite modes
- Prompt template autofill lives in `config/index.ts`
- `OInputAI` can polish prompts and image descriptions through
  `postPolishContent`
- JSON import/export round-trips the full config
- `normalizeForm()` sanitizes load/import data and handles old localStorage
  shapes
- Completion progress is computed from required sections
- Generation is login-gated and streams progress through
  `streamPostOfficialPublisher()`

### Tool: Image Studio

`src/pages/Tools/ToolImageStudio/` powers `/tools/smart-image-compressor`.

Key behaviors:

- Multi-image upload with drag/drop and previews
- Browser-side canvas resize and format conversion for PNG/JPEG/WebP
- Optional TinyPNG compression via `postTinifyImage`
- AVIF input support with browser fallback output handling
- Base64 image import/copy helpers in `components/ImageToolParts/`
- Batch processing with per-item status and ZIP download through `jszip`
- Local structure: `config/index.ts` for tool id and SEO key,
  `utils/imageProcessing.ts` for canvas transforms

### Tool: Timezone Converter

`src/pages/Tools/ToolTimezoneConverter/` powers `/tools/timezone-converter`.

Key behaviors:

- Converts local date/time between two selected IANA time zones
- Uses `Intl.DateTimeFormat` for localized display names, offsets, and DST
  handling
- Local structure: `config/index.ts` for zone options and SEO keys,
  `utils/dateTime.ts` for parsing/formatting, `components/TimezoneSideCard/` for
  the per-side panel

### Tool: Work Report Polisher

`src/pages/Tools/ToolWorkReportPolisher/` powers `/tools/work-report-polisher`.

Key behaviors:

- Persists daily/weekly report form state to `orz2:work-report-polisher-form`
- Builds a restrained polishing prompt from the selected report type, source
  notes, and optional reference example
- Calls `postPolishContent()` with `daily_weekly_report`
- Keep prompt construction and form normalization local unless another tool
  needs the same behavior

### Build Info

Build scripts run `xbi generate` before TypeScript/Vite builds. Generated files
are served from:

- `public/__xshuliner__/build-info.js`
- `public/__xshuliner__/build-info.json`

`index.html` loads the JS file, `useBuildInfo()` falls back to fetching the
JSON, `OFooter` shows the current version/commit when available, and
`/build-info` renders the full metadata plus latest commits.

When build info is missing in dev, the page should degrade gracefully. Do not
hand-edit generated build-info files unless you are intentionally updating test
fixtures or static generated output.

### SEO & Sitemap

`src/config/seo.ts` is the source for page SEO and tool SEO. Use localized
messages and catalog accessors when adding routes.

SEO rules:

- Page components should only select the localized `SeoConfig`; keep title,
  description, canonical path, robots, keywords, OpenGraph image, and JSON-LD in
  `src/config/seo.ts`.
- Every public indexable route needs title, description, canonical, alternate
  locale links, OpenGraph/Twitter tags, and useful JSON-LD when the page has a
  known schema. Use `routeUrl()` / `toSiteUrl()` for all absolute URLs.
- Internal, diagnostic, or design-only routes should use
  `robots: noindex, follow` and must not be added to the sitemap.
- Catalog list JSON-LD should include item names and canonical entry URLs when a
  primary link exists.

`scripts/generate-sitemap.mjs` writes `public/sitemap.xml`. It includes:

- Static indexable pages: `/`, `/products`, `/tools`, `/team`, `/privacy`
- Internal primary tool entries from `tools.ts`
- All three locales plus `x-default` alternates

It does not currently include product detail routes, `/design-system`, or
`/build-info`.

### Semantic HTML Rules

Prefer semantic elements over neutral containers when the element's purpose is
clear:

- Page content belongs under the single app `<main id="main-content">`.
- Page heroes and section headings should use `<header>` with one page-level
  `<h1>` per route and nested `<h2>` / `<h3>` headings in order.
- Navigation belongs in `<nav>` with a localized accessible name.
- Repeated standalone catalog/team cards should render as `<article>`.
- Supporting summaries, table-of-contents blocks, and side notes should render
  as `<aside>`.
- Search/filter regions should use `<search>` when supported by the local
  toolchain; otherwise use a container with `role="search"`.
- Data label/value rows should use `<dl>`, `<dt>`, and `<dd>`.
- Give titled `section` elements `aria-labelledby` pointing at the local
  heading. Use localized `aria-label` only when there is no visible heading.

### Tests

Playwright tests live in `tests/smoke.spec.ts`. Current coverage checks:

- Public route rendering
- Login modal open/Escape close
- Locale switching and localized navigation
- Theme system/manual dark behavior and persistence
- Canonical and alternate SEO links
- Design-system modal close behavior
- Silicon page independent theme/header behavior

Run `pnpm run test:e2e` after changes that affect routes, layout, SEO, theme,
auth modal behavior, or public page rendering.

### Naming Convention

Components and pages use noun-first PascalCase and folder-based modules:

- Pages: `PageHome`, `PageProducts`, `PageTools`, `PageTeam`, `PagePrivacy`,
  `PageDesignSystem`, `PageBuildInfo`
- Product/tool modules: `Products/ProductSilicon`,
  `Tools/ToolOfficialPublisher`, `Tools/ToolImageStudio`,
  `Tools/ToolTimezoneConverter`, `Tools/ToolWorkReportPolisher`
- Shared components: `LayoutApp`, `ContextAuth`, `Seo`, `EffectsMotion`,
  `SectionHero`, `SectionTools`, `SectionProducts`, `SectionCatalogRecent`,
  `SectionTestimonial`, `SectionContact`
- Design system and shell components: `O*`, including `OHeader` and `OFooter`

Within a product/tool module, the same folder split (see Directory Ownership &
Placement Rules) applies locally: `routes/` for lazy routes, `pages/` for
route-level screens, `components/` for feature-only JSX, `config/` for
feature-only static options and defaults, `hooks/` for local hooks, `utils/` for
local pure functions. Promote code to `src/components`, `src/hooks`, or
`src/utils` only after it is genuinely shared.

### Static Assets & Output

- `dist/` is production output and should usually be treated as generated.
- `public/` contains root-served static files such as `robots.txt`, `ads.txt`,
  `sitemap.xml`, build-info files, and public skill assets.
- Remote images/videos are mostly served from `https://cos.orz2.online`.
- `vite.config.ts` sets `base: '/uat/'` only for mode `uat`; all other modes use
  `/`.

### Practical Guidelines

The Directory Ownership & Placement Rules already cover most daily decisions. In
addition:

- Prefer `O*` components and existing helpers before adding raw UI; reach for
  raw DOM only when no design-system component fits.
- Keep lifecycle values in catalog config as uppercase `LIVE`, `BETA`, or
  `PLANNING`; render them through helpers, never inline.
- Keep component-local CSS next to the component and reuse global tokens instead
  of inventing one-off colors or spacing.
- `CacheManager` stores namespaced keys and optional expiry metadata; remember
  browser storage keys may not match the raw key string.
- Do not edit generated `dist/`, `*.tsbuildinfo`, `test-results/`, or build-info
  artifacts unless the task explicitly calls for generated output.
