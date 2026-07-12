# ORZ2

ORZ2 是一个商用在线工具与产品展示站点的纯前端工程，基于 **React 18 + Vite 6 +
TypeScript**。项目本身不包含后端；登录、会员中心、Silicon 成员数据、内容润色、公众号发布、图片压缩等运行时能力通过
`src/api/orz2.ts` 调用远端 ORZ2 API。

站点主域：`https://orz2.online`，支持中 / 英 / 日三语。生产侧已接入 Google
AdSense 与 GA4；本地运行时如需彻底避免广告脚本，可临时清空对应环境变量。站点还会在浏览器本地记录性能画像，用于对受限设备减少预取和延迟加载，不会上传 RUM 数据。

## 准备工作

- Node.js 22（部署工作流使用的版本；兼容 Vite 6）
- `pnpm@10.34.3`（已在 `package.json` 中锁定，使用 Corepack 启用即可）

## 本地开发

```bash
pnpm install
pnpm run dev          # Vite dev server，监听 0.0.0.0:5173
pnpm run start:local  # 加载 .env.dev
pnpm run start:uat    # 加载 .env.uat
pnpm run start:prod   # 加载 .env.prod（用生产 API 排查线上问题）
```

切到 prod 环境不需要重新打包：见 `AGENTS.md` 中的 _Debugging With The Production
Environment_。

`.env.*` 文件改动后必须重启 dev server，Vite 不会热重载环境变量。

## 环境配置

| 文件        | `VITE_APP_ENV` | API base                                  | 站点 base                 | Ads / Analytics                         |
| ----------- | -------------- | ----------------------------------------- | ------------------------- | --------------------------------------- |
| `.env`      | `prod`         | `https://orz2.online/api/smart/v1`        | `https://orz2.online`     | AdSense + GA4 变量已配置                |
| `.env.dev`  | `local`        | `http://localhost:9002/apilocal/smart/v1` | `https://orz2.online`     | AdSense + GA4 变量已配置，GA 本地不加载 |
| `.env.uat`  | `uat`          | `https://orz2.online/apiuat/smart/v1`     | `https://orz2.online/uat` | AdSense + GA4 变量已配置，GA 不加载     |
| `.env.prod` | `prod`         | `https://orz2.online/api/smart/v1`        | `https://orz2.online`     | AdSense + GA4 生产启用                  |

GA4 还有运行时保护：只有 `VITE_APP_ENV=prod`、GA ID 合法且当前域名匹配
`VITE_SITE_URL` 时才会加载。AdSense 在 `index.html` 中按
`VITE_GOOGLE_ADSENSE_CLIENT` 是否为合法 `ca-pub-...` 客户端号加载。

## 构建与部署

```bash
pnpm run build:local  # dist/，base /
pnpm run build:uat    # base /uat/，部署到 https://orz2.online/uat
pnpm run build:prod   # 部署到 https://orz2.online
pnpm run generate:sitemap # 仅重新生成 public/sitemap.xml（默认 prod 环境）
```

构建流水线：`clean` → `generate:sitemap` → `xbi generate` → `tsc -b` →
`vite build`。构建元信息输出到
`public/__xshuliner__/build-info.{js,json}`，可通过 `/build-info` 页面查看。

## 测试与代码规范

```bash
pnpm run test:e2e   # Playwright 烟雾测试，配置在 playwright.config.ts
pnpm run lint       # ESLint --fix on src
pnpm run format     # ESLint --fix + Prettier 写回
```

日常开发和评审中请善用 `standardize-web-code` SKILL：先根据
`AGENTS.md`、`package.json`、路由、目标模块、调用方和测试确认当前 React/Vite 边界，再检查文件归属、命名、状态是否可派生、i18n 文案归位、API/缓存契约、安全删除和验证范围。它适合用来给新增页面、工具模块、重构、评审和目录治理兜底。

## i18n 与文案规则

除 `src/pages/Products/ProductSilicon/`
这个独立产品微站外，项目内所有用户可见文案、catalog 展示字段、SEO 文案、LLM
prompt 模板、兜底错误文案和测试选择器都应放在
`src/i18n/locales/{zh-CN,en,ja}.ts`，组件和工具逻辑通过 `messages`
或本地化 catalog 访问器读取。

`src/config/products.ts`、`src/config/tools.ts` 和功能 config 只保留 id、group
key、URL、媒体、生命周期、SEO
slug 等结构信息，不再写中文基础文案。新增 catalog 条目时必须同步补齐三语 locale 映射，缺失映射应被视为错误，而不是回退到中文硬编码。

## SEO 与语义化

- 页面 SEO 以 `src/config/seo.ts` 为唯一入口，页面组件只负责调用 `Seo`
  并传入当前 locale 的配置。
- 公开页面必须有明确的 `title`、`description`、canonical、alternate locale
  links 和必要的 JSON-LD；内部调试页使用 `robots: noindex, follow`。
- `scripts/generate-sitemap.mjs` 只收录允许索引的公开入口。新增 `noindex`
  页面时不要加入 sitemap；页面索引策略变更后需要同步脚本与文档。
- 每个路由渲染在唯一的 `<main id="main-content">` 中，页面级 hero 使用
  `<header>` + 一个 `<h1>`。
- 内容分区优先使用语义标签：导航用 `<nav>`，独立卡片用 `<article>`，补充信息用
  `<aside>`，目录过滤用 `<search>` 或 `role="search"`，定义型信息用 `<dl>`。
- 可见分区优先通过标题建立结构：`section` 使用 `aria-labelledby`
  指向本区标题；无标题时再使用本地化 `aria-label`。

## 目录速览

```
src/
  api/        远端 ORZ2 API 封装
  assets/     构建期被源码引用的静态资源
  components/ 共享设计系统、Shell、Section、SEO、Auth、Analytics 组件
  config/     静态目录、站点、SEO 配置
  hooks/      跨页面复用的 React hooks
  i18n/       自研轻量 i18n：locale 元数据、消息字典、catalog 投影
  pages/      路由页面、产品、工具模块
  routes/     三语种路由树
  styles/     Tailwind 入口 + 全局主题 + 基础样式
  theme/      ThemeProvider
  types/      共享 TypeScript 类型
  utils/      纯函数与基础设施工具

docs/         人读文档（UI/UX 规范）
scripts/      构建期脚本（sitemap 生成器）
tests/        Playwright E2E
public/       站点根目录静态文件、sitemap、build-info
```

当前主要路由包括首页、产品目录、Silicon 产品页与成员页、工具目录、会员资料和积分记录、团队页、隐私页、设计系统页和构建信息页。工具目录现含公众号发布助手、批量图片工作室、时区转换器、日报周报润色器，以及 JSON 格式化、调色板、Base64 转换、Markdown 编辑和二维码生成等浏览器端开发者工具。

路由模块使用按优先级的懒加载；用户悬停或聚焦内部导航时会在非受限设备上预取目标页面。新增公开页面时，同步
`src/routes/`、`src/config/seo.ts`、三语 locale、必要的 sitemap 生成逻辑与 Playwright 覆盖。

## 发布与缓存

GitHub Actions 的手动 Deploy 工作流使用 Node 22，运行 `pnpm run build:prod` 或
`pnpm run build:uat` 后部署 `dist/`。静态站点的 Nginx 缓存片段位于
`docs/nginx-static-cache.conf`：哈希资源长期缓存，`index.html`
始终重新验证，确保新部署的资源图可被正确引用。

## 相关文档

- `AGENTS.md` —— 面向编码 Agent：架构、目录归属与放置规则、命名约定
- `docs/UI_UX_GUIDELINES.md` —— 新增页面时的 UI/UX 参考
- `docs/ADSENSE_CHECKLIST.md` —— Google AdSense 接入、审核与发布检查清单
