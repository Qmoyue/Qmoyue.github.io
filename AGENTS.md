# 仓库 Agent 指令

## 0. 读取与执行顺序

开始工作前：

1. 阅读本文件。
2. 阅读 `docs/architecture.md`；它是唯一版本化的架构事实源。
3. 如果本机存在 `docs/todo.md`，每轮只执行其中第一个待办。
4. 只在需要当前证据或执行方法时读取其他被忽略的本地工作簿。

本地工作簿不得成为构建、测试、贡献或理解公共 API 的必要条件。

## 1. 开发服务器

开发服务器必须使用后台模式：

```bash
astro dev --background
```

使用以下命令管理：

```bash
astro dev status
astro dev logs
astro dev stop
```

迁移到统一 scripts 后，`vp run dev:bg/status/logs/stop` 必须仍委托这些 Astro 命令。禁止用内建 `vp dev` 代替 Astro。

## 2. 官方资料

涉及对应能力前查阅一手资料：

- [Astro 路由](https://docs.astro.build/en/guides/routing/)
- [Astro 组件](https://docs.astro.build/en/basics/astro-components/)
- [Astro 群岛](https://docs.astro.build/en/guides/framework-components/)
- [Astro Vue 集成](https://docs.astro.build/en/guides/integrations-guide/vue/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro Markdown](https://docs.astro.build/en/guides/markdown-content/)
- [Astro 样式](https://docs.astro.build/en/guides/styling/)
- [Tailwind theme variables](https://tailwindcss.com/docs/theme)
- [shadcn-vue Astro 安装](https://www.shadcn-vue.com/docs/installation/astro)

## 3. 架构边界

- Astro 拥有路由、布局、内容查询、SEO、静态渲染和无交互结构。
- Vue 3 只负责确有浏览器状态的局部群岛。
- 禁止 SPA、Vue Router、Pinia、Nuxt 或未经决策的应用框架。
- 每次只迁移一个垂直切片；新所有者接管时必须删除旧脚本和旧 CSS。
- 静态模块使用 Astro；协作状态模块成为最近 Vue 群岛的子组件。
- 通用 framework、Moyue preset 与个人 site 数据必须分层。
- 禁止在通用组件中硬编码 Moyue 个人内容或素材。
- pnpm 是唯一包管理器；只允许 `pnpm-lock.yaml`。
- Vite+ 是受门禁控制的统一入口：使用 `vp install` 和 `vp run <script>`，禁止用内建 `vp dev/build` 绕过 Astro scripts。

## 4. Dependency safety

- 不因“最新”或“最热”升级依赖。
- 有 LTS channel 的 runtime/tool 默认选择仍受支持的 LTS major，并使用该 major 中已修复安全问题的 patch。
- 没有 LTS channel 的 package 选择兼容性经过验证的 stable release；禁止默认采用 alpha、beta、RC、canary、nightly 或 `latest` tag。
- Node 与 pnpm 声明经过验证的兼容范围，允许同一受支持 major 内的安全 patch；direct dependencies 使用 exact version，transitive dependencies 由唯一 lockfile 固定。
- 每次只升级一个 dependency family；升级前检查 compatibility、changelog、security advisory、license、peer dependencies 与 install scripts。
- Security fix 采用官方修复的最小受支持版本并独立验证；不得借“保持旧版本”延迟漏洞修复。
- Dependency update 禁止 auto-merge，必须通过相称的 check、test、build、E2E 和 visual review。

## 5. 视觉边界

结构重构不是重新设计。除非用户另行批准，必须保持：

- 当前布局、配色、素材、响应式结果；
- 首页渐进式开场和阶段顺序；
- 两屏切换与进度轨；
- 终端输入和字符变换；
- 头像、吉他和气泡反馈；
- 樱花和下落标签的观感与行为。

视觉方向是“二次元日记封面 × 温暖技术笔记本”：暖纸白、樱花粉、柔和天蓝、浅桃、温柔黄和克制薄荷绿。禁止主导性蓝紫渐变、冷灰玻璃、霓虹赛博、企业作品集、通用 SaaS 卡片和 AI 模板文案。

## 6. 实现约束

- 数据、配置、props 与群岛边界使用 TypeScript，禁止用 `any` 绕过类型。
- Tailwind CSS 4 只负责语义 token 与常规 utilities；迁移期间关闭 Preflight。
- 签名布局与复杂动效使用组件自有 scoped CSS。
- shadcn-vue 源码放在 `src/components/ui/`，只添加真实消费者需要的 primitive。
- 禁止把终端、头像、吉他、樱花、下落标签或首页 block 改成通用 shadcn Card。
- 禁止给遗留全局 CSS 继续追加 override/fix/fallback。
- 内容元数据或封面无效时构建失败，禁止静默 fallback。
- 运行时资源放在 `public/images/`；构建优化源与文章封面放在 `src/assets/`。
- 保持键盘访问、可见焦点、alt、label、reduced motion 与无 JS 核心内容。

## 7. 单任务完成条件

完成一个切片前，按适用范围验证：

1. 内容 contracts；
2. `astro check`；
3. unit/component tests；
4. static build；
5. Playwright 与 accessibility journeys；
6. 桌面/移动签名视觉回归；
7. 旧实现已删除；
8. 没有新增第二 lockfile、`any`、字符串事件总线或全局 override。
9. Dependency change 已记录 version rationale、compatibility、security evidence 与 rollback path。

测试保护用户可见能力和公共契约。除非细节本身就是产品契约，不断言精确 class、任意像素、computed RGB 或第三方库内部状态。
