# ORZ2 UI/UX 规范

本规范适用于 ORZ2 主站、在线工具和后续新增功能。`ProductSilicon` 等具有独立视觉主题的产品页可以保留自己的主题，但不应覆盖全局 token。

## 1. 设计原则

- 清晰优先：页面先表达任务、状态和下一步操作，再表达装饰。
- 克制统一：使用白色面板、浅绿色状态面和少量暖色提醒，避免为单个模块新增近似颜色。
- 层级稳定：同类页面使用一致的容器宽度、标题层级、卡片间距和控件高度。
- 桌面高效：工具页优先保证桌面端信息密度和扫描效率，再通过响应式布局适配移动端。
- 可访问：交互元素支持键盘焦点，图标按钮必须提供 `aria-label`，弹窗使用 `OModal`。

## 2. 使用入口

- 视觉 token：`src/styles/theme.css`
- 公共组件：`src/components/O*/`
- 公开样式页：`/design-system`
- 新页面应优先组合 `OButton`、`OIconButton`、`OCard`、`OBadge`、`OPageHero`、`OSectionHeading`、`OEmptyState` 和 `OModal`。

## 3. 布局与间距

页面最大宽度为 `1180px`，桌面端两侧安全边距为 `20px`，移动端为 `14px`。页面容器统一使用 `--page-content-width`。

间距只从以下层级中选择：

| Token | Value | 常见用途 |
| --- | ---: | --- |
| `--space-1` | `4px` | 图标与短文本微间距 |
| `--space-2` | `8px` | 紧凑控件、标签间距 |
| `--space-3` | `12px` | 按钮组、局部内容间距 |
| `--space-4` | `16px` | 卡片网格、常规分组 |
| `--space-5` | `20px` | 中型面板内容 |
| `--space-6` | `24px` | 大型面板内容 |
| `--space-8` | `32px` | 页面内部区块 |
| `--space-10` | `40px` | 营销型卡片、Hero 内容 |
| `--space-12` | `48px` | 大区块间距 |
| `--space-16` | `64px` | 页面级节奏 |
| `--space-20` | `80px` | 页面首尾留白 |

## 4. 字体层级

| Token | Value | 用途 |
| --- | ---: | --- |
| `--text-caption` | `12px` | 辅助说明、状态时间 |
| `--text-meta` | `13px` | 标签、次要元信息 |
| `--text-body-sm` | `14px` | 工具页正文、控件文字 |
| `--text-body` | `16px` | 页面正文 |
| `--text-lead` | `17px` | Hero 与区块描述 |
| `--text-heading-sm` | `20px` | 卡片标题、工具面板标题 |
| `--text-heading-md` | `28px` | 文章章节、弹窗标题 |

页面主标题和大区块标题使用 `--text-page-title` 与 `--text-section-title`。正文默认使用 `--line-height-body`，紧凑工具说明使用 `--line-height-compact`。

## 5. 控件与反馈

按钮尺寸只使用以下三级：

| Size | Height | 使用场景 |
| --- | ---: | --- |
| `sm` | `36px` | 表格、紧凑工具栏和局部操作 |
| `md` | `44px` | 默认按钮和导航操作 |
| `lg` | `48px` | Hero CTA、提交和关键确认 |

规则：

- 每个操作区只保留一个 `primary` 主操作。
- `secondary` 用于并列次级操作，`ghost` 用于弱化操作。
- 表单输入框统一为 `48px` 高。
- 焦点、hover、disabled 状态由公共组件处理；不要在业务页复制一套按钮样式。
- 标签优先使用 `OBadge`；业务特定 chip 可以保留局部样式。

## 6. 卡片与弹窗

常规卡片圆角为 `8px`，弹窗圆角为 `12px`。卡片内容内边距只使用 `sm`、`md`、`lg`：

| Padding | Value | 使用场景 |
| --- | ---: | --- |
| `sm` | `16px` | 紧凑提示、工具侧栏 |
| `md` | `20px` | 摘要卡、普通卡片 |
| `lg` | `24px` | 表单面板、目录卡片 |

规则：

- 容器优先使用 `OCard`，根据语义选择 `default`、`soft`、`brand`、`warm` 或 `danger`。
- 需要 hover 和 tilt 的卡片使用 `interactive`，表单面板不要添加无意义 hover。
- 所有弹窗使用 `OModal`，业务层只提供内容和关闭按钮。

## 7. 工具页桌面布局

- 工具页使用 `minmax(0, 1fr) 320px` 的主栏与摘要栏布局。
- 面板间距使用 `16px`，工作区列间距使用 `20px`。
- 右侧摘要栏保持 sticky，关键提交按钮使用 `lg` 尺寸。
- tabs、checkbox 标签、自动填充 chip 等业务控件可以保留局部样式，但必须复用颜色、圆角、动效和间距 token。

## 8. 新功能检查清单

- 是否优先复用了 `O*` 组件？
- 是否只使用了既有 token 和规定的尺寸层级？
- 是否存在明确的 loading、empty、error 和 disabled 状态？
- 图标按钮是否有 `aria-label`，表单是否有可读标签？
- 桌面、平板、移动端是否都完成了浏览器检查？

