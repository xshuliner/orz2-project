# ORZ2

ORZ2 是一个商用在线工具与产品展示站点的纯前端工程，基于 **React 18 + Vite 6 + TypeScript**。
项目本身不包含后端；登录、Silicon 成员数据、内容润色、公众号发布、图片压缩等运行时能力通过 `src/api/orz2.ts` 调用远端 ORZ2 API。

站点主域：`https://orz2.online`，支持中 / 英 / 日三语。

## 准备工作

- Node.js（兼容 Vite 6）
- `pnpm@10.34.3`（已在 `package.json` 中锁定，使用 Corepack 启用即可）

## 本地开发

```bash
pnpm install
pnpm run dev          # Vite dev server，监听 0.0.0.0:5173
pnpm run start:local  # 加载 .env.dev
pnpm run start:uat    # 加载 .env.uat
pnpm run start:prod   # 加载 .env.prod（用生产 API 排查线上问题）
```

切到 prod 环境不需要重新打包：见 `AGENTS.md` 中的 *Debugging With The Production Environment*。

`.env.*` 文件改动后必须重启 dev server，Vite 不会热重载环境变量。

## 环境配置

| 文件        | API base                                  | 站点 base                 | AdSense |
| ----------- | ----------------------------------------- | ------------------------- | ------- |
| `.env`      | -                                         | -                         | 空      |
| `.env.dev`  | `http://localhost:9002/apilocal/smart/v1` | `https://orz2.online`     | 空      |
| `.env.uat`  | `https://orz2.online/apiuat/smart/v1`     | `https://orz2.online/uat` | 空      |
| `.env.prod` | `https://orz2.online/api/smart/v1`        | `https://orz2.online`     | 启用    |

## 构建与部署

```bash
pnpm run build:local  # dist/，base /
pnpm run build:uat    # base /uat/，部署到 https://orz2.online/uat
pnpm run build:prod   # 部署到 https://orz2.online
```

构建流水线：`clean` → `generate:sitemap` → `xbi generate` → `tsc -b` → `vite build`。
构建元信息输出到 `public/__xshuliner__/build-info.{js,json}`，可通过 `/build-info` 页面查看。

## 测试与代码规范

```bash
pnpm run test:e2e   # Playwright 烟雾测试，配置在 playwright.config.ts
pnpm run lint       # ESLint --fix on src
pnpm run format     # ESLint --fix + Prettier 写回
```

## 目录速览

```
src/
  api/        远端 ORZ2 API 封装
  assets/     构建期被源码引用的静态资源
  components/ 共享设计系统、Shell、Section 组件
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

## 相关文档

- `AGENTS.md` —— 面向编码 Agent：架构、目录归属与放置规则、命名约定
- `docs/UI_UX_GUIDELINES.md` —— 新增页面时的 UI/UX 参考
- `docs/ADSENSE_CHECKLIST.md` —— Google AdSense 接入、审核与发布检查清单
