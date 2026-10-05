# 博客项目目标架构

> 状态：唯一版本化的架构事实源
> 读者：贡献者、维护者与编码 Agent
> 范围：长期有效的产品契约与目标边界，不记录任务进度

本文只说明项目允许如何演进，以及重构时必须保护什么。文中出现的目标目录或依赖不代表它们已经实现。

规范词含义：

- **必须 / 禁止**：所有变更都要遵守。
- **应 / 不应**：默认做法；偏离时必须在变更说明中写明理由。
- **可以**：在其他约束内可选。

## 0. Agent 工作契约

修改结构、UI、动效、内容管线、Vue、Tailwind、shadcn-vue、pnpm 或 Vite+ 前：

1. 阅读 `AGENTS.md` 和本文。
2. 检查当前实现，不得假设目标依赖或目录已经存在。
3. 只选择一个用户可见能力和一个状态所有者，形成一个垂直切片。
4. 替换前记录当前行为、相关测试与受保护视觉状态。
5. 实现新所有者，完成验证，并在同一切片删除旧脚本和旧 CSS。
6. 该切片完成后停止，不得默认继续下一项。

`docs/` 下可以存在本地审计、迁移手册和 TODO，但它们由 `.gitignore` 排除，只能协调本机工作。它们不得覆盖本文，也不得成为构建、测试、贡献或理解公共 API 的前置条件。

### 0.1 当前态与目标态

| 范围       | 当前过渡状态                      | 目标状态                                                            |
| ---------- | --------------------------------- | ------------------------------------------------------------------- |
| 渲染       | Astro 静态站点                    | Astro 静态站点                                                      |
| 客户端行为 | 原生 JavaScript、全局 DOM 查询    | 有明确所有者的小型 Vue 3 群岛                                       |
| 样式       | 单个大型遗留全局样式表            | 语义 token + Tailwind CSS 4 utilities + 组件自有 CSS + 局部正文 CSS |
| UI 原语    | 零散手写控件                      | 按需纳入、源码归仓库所有的 shadcn-vue 原语                          |
| 内容       | Astro Collections 与宽松 fallback | 严格 schema，错误在构建期失败                                       |
| 包管理     | pnpm 11                           | 兼容的 pnpm 11/12 版本，且只有 `pnpm-lock.yaml`                     |
| 任务入口   | `package.json` scripts            | `pnpm run` 与 `vp run` 调用同一 scripts                             |

Agent 必须把右列理解为迁移目标，不能当成当前实现证据。

## 1. 产品契约

本项目的目标形态同时包含：

1. **可复用博客框架**：静态内容管线、组件契约、配置、主题边界、测试与开发命令。
2. **Moyue 默认预设与示例站点**：当前温暖的二次元手账视觉、内容、素材与首页签名体验。

framework 尚未命名。`certain-cloud` / Certain Cloud 只表示当前 repository 或 site，不是 framework、package、CSS namespace 或 public API 的正式名称。命名决策落地前，禁止从当前项目名派生公开标识。

使用者必须能够通过公开配置、预设、资源角色和组件替换定制站点，而不是修改通用内部实现。通用代码禁止硬编码 Moyue 的文案、账号、文章或个人素材。

### 1.1 不可破坏的原则

- Astro 必须拥有路由、布局、内容查询、SEO、图片优化与静态渲染。
- 项目必须保持纯静态部署，不依赖数据库、服务端运行时或常驻 API。
- Vue 只能负责浏览器状态与需要协调的交互。
- 禁止把站点改成 SPA；不引入 Vue Router、Nuxt 或 Pinia。
- 核心内容和导航必须存在于服务端生成的 HTML 中，并在无 JavaScript 时可用。
- 结构重构必须保持现有视觉结果，除非另一个明确任务批准视觉变化。
- 一个切片迁移完成时，必须删除被替代的脚本、选择器、事件总线和 fallback。
- 发布内容无效时必须校验失败；禁止静默补元数据或封面。
- 数据、配置和组件边界必须显式使用 TypeScript；禁止用 `any` 绕过类型。

## 2. 依赖方向与所有权

允许的依赖方向：

```text
Markdown / 类型化站点数据
          ↓
内容 schema 与构建期校验
          ↓
领域查询与不可变视图模型
          ↓
Astro 页面与布局
     ├────────────→ 静态 Astro 组件
     └────────────→ 独立 Vue 群岛
                            ↓
                       浏览器副作用
```

- `domain` 禁止导入页面、UI 组件或浏览器 API。
- 页面应只选择数据、构造视图模型并编排组件。
- 组件禁止反向查询 Content Collection 或发明缺失数据。
- Vue 群岛必须接收可序列化 props。
- 监听器、计时器、动画帧、Observer 与第三方实例必须由同一所有者创建和清理。
- 兄弟组件共享状态时必须提升到最近共同父级；禁止通过字符串命名的 `window` 事件协调。

### 2.1 framework、preset 与 site

```text
framework core
  路由约定、内容契约、领域函数、可访问交互能力
        ↓
theme preset
  语义 token、组件组合、动效参数、资源角色
        ↓
site instance
  身份、文章、项目、友链、账号与已授权素材
```

- Core 禁止导入 Moyue preset 或站点数据。
- Moyue preset 是默认视觉实现，也是迁移期间的 golden master。
- Site 可以覆盖公开 token 和数据，禁止依赖 private selector。
- 在第二个真实消费者证明拆包价值前保持单包仓库，禁止预建空 monorepo 或万能插件系统。

### 2.2 单一所有者

| 关注点         | 唯一所有者                  | 禁止重复的位置             |
| -------------- | --------------------------- | -------------------------- |
| 文章 schema    | `src/content.config.ts`     | 页面内默认值               |
| 文章查询与排序 | Blog repository             | 各页面重复查询             |
| 展示模型       | Domain view-model           | 卡片解析 Content Entry     |
| 封面分配       | 唯一确定性策略              | 页面随机分配               |
| 群岛状态       | 最近的 Vue 父组件           | 全局事件或无关 store       |
| 设计 token     | Foundation + 当前 preset    | 组件自建另一套颜色系统     |
| Markdown 渲染  | Astro 配置 + 唯一代码渲染器 | CSS 抹除渲染 token         |
| 效果生命周期   | 效果组件/composable         | 页面全局 timer 与 DOM 查询 |

## 3. 组件模型

组件化与水合是两个决定：

- 每个有意义的视觉或行为模块必须有一个所有者。
- 静态模块应使用 Astro 组件，不发送客户端 JavaScript。
- 有状态模块应成为最近群岛内的 Vue 子组件。
- 没有独立语义、状态、样式责任、测试契约或替换价值的 wrapper 不应单独建文件。

### 3.1 顶层群岛

| 群岛                  | 水合策略                        | 所有权                                     |
| --------------------- | ------------------------------- | ------------------------------------------ |
| `NavigationMenu.vue`  | `client:load`                   | 开关、焦点、键盘与外部点击                 |
| `HomeExperience.vue`  | `client:load`                   | 开场时间线、两屏状态、首页输入与协作子组件 |
| `ArchiveSearch.vue`   | `client:idle`                   | 查询状态与结果过滤                         |
| `ArticleToc.vue`      | `client:idle`                   | 对静态目录增强当前标题追踪                 |
| `ReadingProgress.vue` | `client:idle` 或 `client:media` | 非首页阅读进度                             |

不应使用 `client:only`。Vue 应先生成有用的静态 HTML，再在浏览器增强。

### 3.2 静态 Astro 模块

静态模块包括：

- 站点外壳、跳转链接、页脚、SEO 与布局；
- 文章、项目、友链和个人资料展示；
- 正文宿主和静态目录链接；
- `SakuraField.astro`，包括确定性花瓣生成和组件自有样式。

禁止为了形式统一而把樱花强行改成 Vue。只有真实的运行时控制需求出现时，才评估群岛化。

### 3.3 首页群岛组件树

```text
HomeExperience.vue
├─ opening/
│  ├─ HomeOpeningSequence.vue
│  ├─ HomeBrand.vue
│  ├─ AvatarStage.vue
│  │  ├─ AvatarFrame.vue
│  │  ├─ AvatarPortrait.vue
│  │  ├─ GuitarInteraction.vue
│  │  └─ AvatarSpeech.vue
│  ├─ IdentityTerminal.vue
│  │  ├─ TerminalChrome.vue
│  │  └─ TerminalTranscript.vue
│  └─ HomeOpeningCue.vue
├─ deck/
│  ├─ HomeSceneDeck.vue
│  └─ HomeBentoGrid.vue
│     ├─ LatestPostBlock.vue
│     ├─ FlowerBannerBlock.vue
│     ├─ ProfileBlock.vue
│     ├─ ClockBlock.vue
│     ├─ CalendarBlock.vue
│     └─ QuoteBlock.vue
├─ effects/
│  ├─ FallingTags.vue
│  └─ FallingTagChip.vue
├─ HomeScrollRail.vue
├─ useHomePanels.ts
├─ useOpeningTimeline.ts
├─ useTerminalSequence.ts
└─ useMatterWorld.ts
```

所有权规则：

- `HomeExperience` 只协调共享状态，禁止吞并所有子组件模板和样式。
- `useOpeningTimeline` 拥有命名阶段与取消；子组件禁止各自启动无关魔法计时。
- `AvatarStage` 负责组合；头像框、头像、吉他交互和气泡必须可独立替换。
- `IdentityTerminal` 是完整语义单元；替换终端外壳不应重写字符播放逻辑。
- `FallingTags` 接收 `HomeExperience` 的面板状态，不是第二个顶层群岛。
- `useMatterWorld` 拥有 Matter engine、body、resize、动画帧、timer 与幂等清理。
- `FallingTagChip` 只拥有单个标签的语义和外观，不创建物理世界。
- 时钟和日历保持分离，因为数据与更新频率不同。

### 3.4 可替换组件契约

公共可替换组件必须提供：

- 不包含隐藏内容查询的类型化 props；
- 表达用户意图的类型化 emits；
- 只用于稳定替换点的命名 slots；
- 语义 HTML，以及确有外部需求时才公开的 `data-part`；
- SSR / 无 JavaScript 结果；
- 组件契约测试和代表性视觉 fixture。

测试禁止冻结 Tailwind class 字符串、shadcn-vue 内部 DOM、私有 DOM 深度或 Matter 内部结构。

### 3.5 DIY 层级

1. **站点配置**：身份、链接、内容、文案与功能开关。
2. **预设 token 与资源**：配色、字体、表面、动效强度与图片角色。
3. **类型化组合清单**：启用、排序和放置允许的首页 block。
4. **组件替换**：用实现相同契约的组件替换。

Block manifest 必须直接 import 组件并使用有限的语义 `area`。禁止运行时组件路径字符串、任意像素坐标或序列化 Vue constructor。

```ts
export const homeBlocks = [
  defineHomeBlock({ id: "latest", area: "latest", component: LatestPostBlock }),
  defineHomeBlock({ id: "profile", area: "profile", component: ProfileBlock }),
] satisfies readonly HomeBlockDefinition[];
```

## 4. 受保护的视觉契约

Moyue preset 的方向是：**二次元日记封面 × 温暖技术笔记本**。

### 4.1 视觉语言

- 使用暖纸白、樱花粉、柔和天蓝、浅桃、温柔黄和克制薄荷绿。
- 优先纸张感或温暖半透明表面、低对比边框与柔和阴影。
- 保留插画氛围、小型装饰细节和克制的玩心动效。
- 长篇技术正文与语法区分优先于装饰。
- 禁止主导性蓝紫渐变、冷灰玻璃仪表盘、霓虹赛博、企业作品集、通用 SaaS 卡片和通用 AI 落地页文案。

### 4.2 零视觉漂移

在独立视觉任务批准前，结构工作必须保持：

- 桌面/移动构图、配色、素材、间距关系与响应式结果；
- 品牌 → 头像/吉他 → 终端 → 提示的出现顺序；
- 终端输入、字符 scramble 的观感与最终输出；
- 滚轮、空格、滚动和进度轨的两屏行为；
- 头像/吉他触发与气泡反馈；
- 樱花密度、轨迹、层级和氛围；
- 标签数量范围、碰撞观感、间隔、停留与自底向上消散；
- 第二屏 block 内容、区域和视觉层级。

语义内容必须存在于静态 HTML；普通动效模式可以初始隐藏后按时间线显现。减少动效模式必须跳过长动效并立即提供内容与导航。

### 4.3 迁移观测基线

下表是替换前必须采集的 golden-master 观测值，不是继续分散魔法数字的许可：

| 行为          | 当前观测                                          |
| ------------- | ------------------------------------------------- |
| 品牌开场      | 延迟约 180 ms，持续约 3200 ms                     |
| 桌面头像/吉他 | 约 2850 ms 开始，持续约 2300 ms                   |
| 桌面终端卡    | 约 4380 ms 开始，持续约 760 ms                    |
| 终端播放      | 等待约 4700 ms，暂停 220 ms，36 帧 scramble       |
| 首页提示      | 约 5900 ms 开始，持续约 800 ms                    |
| 吉他/气泡反馈 | 约 720 ms / 2600 ms                               |
| 下落标签      | 8–10 项，间隔约 128 ms，约 5100 ms 后自底向上消散 |

新实现使用命名阶段：`brand → avatar → terminal → terminalContent → cue → settled`。

## 5. 样式架构

### 5.1 全局范围

全局只允许：

- 框架语义 token；
- 一套 reset/base；
- Tailwind CSS 4 theme 与 utilities；
- 页面背景和元素级基线；
- 一份以 `.article-prose` 为根的正文样式；
- 极少量无障碍 utility。

禁止新的全局组件样式表、override、fix 或 fallback pass。

### 5.2 Tailwind CSS 4

- Tailwind 是 utility/编译层，不拥有组件语义或品牌。
- 公共变量使用稳定 namespace；framework 名称与 namespace 需由独立 ADR 确定，在此之前现有变量不构成 public API。
- 用 `@theme inline` 映射语义变量。
- 视觉保持迁移期间必须关闭 Preflight。
- 启用 Preflight 必须是独立 reset 切片，完成视觉审查并同时删除旧 reset。
- 常规布局、间距、文字和响应式规则可以使用清晰 utilities。
- 签名布局、伪元素、素材叠放、终端材质和复杂 keyframe 应保留在 scoped CSS。
- 禁止用超长 arbitrary-value class 串隐藏复制来的遗留 CSS。
- 组件样式应直接读取 CSS 变量；使用 `@apply` 时必须显式 `@reference` 并说明收益。

### 5.3 shadcn-vue

- 生成源码放在 `src/components/ui/`，归仓库所有。
- 只有真实消费者存在时才添加 primitive。
- 必须审查生成 diff，并改用 Moyue 语义 token。
- 必须保留键盘、焦点、ARIA、reduced-motion 与 SSR 行为。
- 第三方 registry 视为不可信源码输入，必须逐文件审查。
- 终端、头像、吉他、樱花、下落标签和首页 block 禁止退化为通用 Card 变体。

### 5.4 切片删除规则

每个迁移组件：

1. 从最终观测视觉重建，不按遗留 override 的时间顺序复制。
2. 验证约定桌面和移动视口。
3. 删除全部被替代 selector 与 keyframe。
4. 禁止新增 `!important` 去压过本应删除的规则。

遗留全局 CSS 必须单调缩小，直到可以删除。

## 6. 内容与 Markdown

### 6.1 内容契约

发布文章必须提供经过校验的标题、描述、发布日期、标签、封面标识、封面 alt 和草稿状态。缺失字段必须让构建失败。

唯一 repository 负责过滤、排序、查询和不可变视图模型。封面策略必须确定：新增文章不能改变旧文章封面。

### 6.2 Markdown 管线

- Markdown 是默认格式。
- 保留 GFM 表格、任务列表、删除线与脚注。
- 真实 fixture 通过后，`astro-expressive-code` 成为唯一 fenced-code 管线。
- 代码 fence 必须写语言；纯文本使用 `text`。
- 页面标题是唯一 H1，正文从 H2 开始。
- Contract tests 校验 fence、标题层级、图片路径/alt、链接和 slug 唯一性。
- `.article-prose` 可以控制生成的语义元素，禁止抹掉 Shiki token 颜色。
- 数学、Mermaid、admonition 或 MDX 只在真实需求、明确边界和 fixture 齐备时引入。

## 7. 配置与资源

- `defineBlogConfig()` 与 `defineThemePreset()` 应提供类型和构建期校验。
- 配置只表达用户意图，不暴露 selector、DOM 路径、timer handle 或求解器内部参数。
- 运行时公共资源放在 `public/images/`。
- 构建优化源文件和文章封面放在 `src/assets/`。
- 友链头像允许站点自有的 `/images/` 文件或外部 HTTPS URL。外部头像由浏览器直接请求并设置 `referrerpolicy="no-referrer"`；不在构建时代理、缓存或无声替换，失效时由站点维护者修正来源。
- 分发的图片、字体、图标和二次元素材必须记录再分发结论。
- 无法确认许可的素材可以保留在个人 site layer，禁止作为 framework default assets 分发。
- 当前仓库的打包素材与再分发状态记录于根目录 `ASSETS.md`；`presets/neutral` 与最小站点 fixture 不依赖 Moyue 图片。

## 8. Dependency safety、包管理与 Vite+

### 8.1 Dependency policy

项目以安全、可维护和可复现为优先，不以“最新版”或“最热”作为采用理由。

- Node.js 等提供 LTS channel 的 runtime/tool 必须选择仍在官方支持期内的 LTS major，并跟进该 major 的 security patch；LTS 不等于长期停留在存在漏洞的旧 patch。
- 没有 LTS 概念的 package（例如 Astro、Vue、Tailwind CSS、shadcn-vue 及其 integrations）必须选择正式 stable release，禁止默认使用 alpha、beta、RC、canary、nightly 或仅因 `latest` tag 更新。
- 新 major 默认不在发布初期直接进入 baseline。只有真实需求、官方 compatibility 证据、migration review 和完整验证齐备时才可采用。
- Node 与 pnpm 声明经过验证的兼容范围；Node 的声明下限由依赖兼容性决定，日常开发和 CI 使用受支持 LTS 的最新安全补丁。direct dependencies 必须精确固定，transitive dependencies 由唯一 lockfile 固定。禁止使用无界范围、第二份 lockfile 或未记录的 global tool 隐藏版本漂移。
- 选择或升级依赖前必须检查 maintenance status、official compatibility、changelog、security advisory、license、peer dependencies、install/build scripts 与 bundle/runtime impact。
- 已知 vulnerability 优先采用官方修复的最小受支持版本；security update 必须独立处理，不能被“暂不追新”用作延迟修复的理由。
- 一次只升级一个 dependency family。包管理迁移、framework major upgrade、formatter/linter replacement 和 UI refactor 必须拆成不同 vertical slices。
- 每次升级都必须保留 before/after evidence，并按影响运行 frozen install、type check、unit/component tests、static build、E2E、accessibility 与 visual regression。
- Dependency bot 可以提出 PR，但禁止 auto-merge；override/resolution 必须写明原因、owner、移除条件和上游 issue。
- 若 supported LTS 与必需 dependency 不兼容，必须通过 ADR 明确取舍，禁止静默改用 Current、EOL 或 prerelease runtime。

### 8.2 pnpm

- pnpm 是唯一目标包管理器。
- 使用与 selected Node LTS compatibility 已验证的 stable pnpm；不得直接跟随 `latest` tag。
- `package.json#engines.node` 声明兼容的 Node LTS 范围；`devEngines.packageManager` 声明兼容的 pnpm 11/12 范围，供 pnpm 与 Vite+ 选择版本。
- 迁移完成后，`pnpm-lock.yaml` 是唯一 lockfile。
- Lockfile 迁移禁止与大范围依赖升级混在一起。
- 必须验证 `sharp` 等原生/构建脚本依赖，禁止全局放开所有安装脚本。
- 只有出现真实 workspace package 或有文档的 Vite+ override 时才添加 workspace 文件。

### 8.3 Vite+

Vite+ 是正在使用但受门禁控制的统一入口：

- 选择经过项目 compatibility matrix 验证的 stable version；禁止默认追随 `latest` 或 prerelease channel。
- `vp install` 应解析到满足项目声明范围的 pnpm。
- 推荐使用 `vp run <script>`。
- `pnpm run <script>` 是可移植保底入口，必须调用同一 script。
- `vp run dev:bg` 与 `vp run build` 执行 Astro package scripts。
- 在架构决策确认集成前，禁止用内建 `vp dev` / `vp build` 替换 Astro。
- `vp migrate` 必须先在隔离环境预览，并审查 manifest、Vite alias、Vitest pin、scripts 与 lockfile。
- 只有确定性任务完成冷/热一致性验证后才能缓存；禁止缓存 dev server、E2E、视觉和外部状态任务。
- Oxfmt、Oxlint 和 Vitest 分别评估，禁止静默替代 Astro check、内容 contract 或 Playwright。

`package.json#scripts` 是任务事实源。随着能力落地，应提供 `dev:bg`、`dev:status`、`dev:logs`、`dev:stop`、`check`、`test:unit`、`test:e2e`、`build` 与 `verify`。

## 9. 无障碍、性能与 SEO

- 导航支持点击、Enter、Space、Escape、外部点击、焦点返回和真实 `aria-expanded`。
- 每页提供 skip link 和可见 `:focus-visible`。
- 图片使用有意义 alt；纯装饰使用空 alt。
- 减少动效模式停止长转场和物理动画，同时保留结果。
- `BaseLayout` 统一拥有 title、description、canonical、Open Graph、Twitter card 与文章元数据。
- RSS、sitemap 与 robots 由 Astro 静态端点生成；404 页面标记 noindex。
- 首页专用 JavaScript 禁止加载到普通页面。
- 图片声明尺寸，避免水合和布局跳动。
- 每个群岛检查 bundle 增长；“流行”不是引入依赖的理由。

## 10. 验证架构

| 层级               | 保护内容                           | 避免                   |
| ------------------ | ---------------------------------- | ---------------------- |
| Content contract   | frontmatter、Markdown、链接、资源  | 只在浏览器发现内容错误 |
| Unit               | 纯领域和时间线逻辑                 | DOM 细节               |
| Component          | 交互与清理                         | class snapshot         |
| Component contract | 公共 props/emits/slots 与 manifest | shadcn/Tailwind 内部   |
| Astro integration  | 数据到静态 HTML 的边界             | 重复领域测试           |
| E2E                | 关键旅程与无 JS 能力               | 精确像素和物理数组     |
| Accessibility      | 语义、键盘、焦点、axe              | 只靠颜色判断           |
| Visual             | 签名页面与命名阶段                 | 批量接受 snapshot      |

首页动效使用三层保护：

1. Fake clock 单测验证阶段顺序、取消和 reduced motion。
2. 桌面/移动 fixture 直接渲染生产组件的 named states。
3. 真实页面 smoke 加一次完整入场录像人工审查。

下落标签 fixture 使用固定 seed，production 保持随机。测试保护触发、碰撞观感、消散顺序、清理和 reduced motion，不绑定 Matter 内部实现。

## 11. 垂直切片完成条件

一个切片只有同时满足以下条件才算完成：

1. 明确一个用户能力和一个状态所有者。
2. 已采集当前桌面/移动行为。
3. Props、emits、slots、数据模型和清理责任明确。
4. 新实现落在正确的 core/preset/site 层。
5. 行为、无障碍、无 JS 与 reduced motion 已验证。
6. 旧 scripts、selectors、events、timers 和 temporary flags 已删除。
7. 内容契约、`astro check`、单元/组件测试、静态构建、相关 E2E 与视觉检查通过。
8. 没有新增 `any`、静默 fallback、全局事件总线、override CSS、第二个 lockfile 或无消费者抽象。
9. 若 dependency 发生变化，版本选择、compatibility、security evidence 与 rollback path 已记录，且符合 8.1 的 policy。

如果删除和验证无法一起完成，应缩小切片，禁止长期保留双实现。

## 12. 目标责任目录

只有首个真实消费者出现时才创建路径：

```text
src/
├─ config/                    # 类型化站点/主题/效果选择
├─ framework/contracts/       # 公共类型与校验器
├─ presets/moyue/             # token、动效、资源、block manifest
├─ site/                      # 个人身份与站点数据
├─ domain/blog/               # repository 与纯领域规则
├─ components/
│  ├─ shell/                  # 静态 Astro 外壳
│  ├─ effects/                # SakuraField 等静态效果
│  ├─ primitives/             # 框架静态原语
│  ├─ ui/                     # 仓库拥有的 shadcn-vue 源码
│  ├─ blog/
│  ├─ project/
│  ├─ friends/
│  └─ profile/
├─ islands/
│  ├─ navigation/
│  ├─ home/
│  ├─ blog/
│  └─ shared/
├─ layouts/
├─ pages/
├─ styles/
│  ├─ foundation/             # token、reset、base、Tailwind 入口
│  └─ prose/                  # 文章生成内容样式
└─ content.config.ts

tests/
├─ contracts/
├─ unit/
├─ component/
├─ integration/
├─ e2e/
├─ accessibility/
└─ visual/
```

## 13. 架构决策摘要

| 主题           | 决策                                             |
| -------------- | ------------------------------------------------ |
| 渲染           | Astro 静态输出                                   |
| 路由           | Astro 文件路由                                   |
| 客户端框架     | 仅 Vue 3 群岛                                    |
| 全局 store     | 在独立群岛证明共享持久状态前不引入               |
| 样式           | 语义变量、Tailwind 4 utilities、组件自有签名 CSS |
| UI 原语        | 按需纳入、源码归仓库所有的 shadcn-vue            |
| 内容           | 严格 Markdown Collection；MDX 需单独决策         |
| 代码渲染       | Fixture 验证后的唯一 Expressive Code 管线        |
| Dependency     | Node/pnpm 兼容范围；direct exact pin + lock      |
| 包管理         | 兼容的 pnpm 11/12 与唯一 pnpm lockfile           |
| 任务控制       | `vp run` 或 `pnpm run` 调用 package scripts      |
| Vite+ 构建命令 | 受门禁控制；内建命令不替换 Astro                 |
| 迁移           | 一次一个验证完成且删除旧路径的垂直切片           |

## 14. 一手资料

- [Astro 路由](https://docs.astro.build/en/guides/routing/)
- [Astro 组件](https://docs.astro.build/en/basics/astro-components/)
- [Astro 框架组件与群岛](https://docs.astro.build/en/guides/framework-components/)
- [Astro Vue 集成](https://docs.astro.build/en/guides/integrations-guide/vue/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Markdown](https://docs.astro.build/en/guides/markdown-content/)
- [Astro 样式与 Tailwind](https://docs.astro.build/en/guides/styling/)
- [Vue Composables](https://vuejs.org/guide/reusability/composables)
- [Tailwind theme variables](https://tailwindcss.com/docs/theme)
- [Tailwind Preflight](https://tailwindcss.com/docs/preflight)
- [shadcn-vue Astro 安装](https://www.shadcn-vue.com/docs/installation/astro)
- [shadcn-vue 介绍](https://www.shadcn-vue.com/docs/introduction)
- [Vite+ 包管理](https://viteplus.dev/guide/install)
- [Vite+ 任务执行](https://viteplus.dev/guide/run)
- [Vite+ 迁移](https://viteplus.dev/guide/migrate)
