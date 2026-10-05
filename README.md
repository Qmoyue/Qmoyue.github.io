# moyue's blog / Certain Cloud

Certain Cloud 是当前的 Astro 静态技术博客项目，也是未来可复用开源博客 framework 的孵化仓库。framework 尚未命名，Certain Cloud 不作为它的正式名称。默认 Moyue preset 保留当前清新、温暖的“二次元日记封面 × 技术笔记本”风格。

## 当前实现

- Astro 7 与 TypeScript
- Astro Content Collections
- Expressive Code 为技术文章提供唯一 fenced-code 渲染管线；正文样式局部限定于 `.article-prose`
- Vue 3 / Tailwind CSS 4 已接入；导航、搜索、文章 TOC、阅读进度与首页交互归局部群岛，静态页面使用 Astro 组件，遗留全局 CSS 与页面脚本已清除
- Vitest unit / Astro component tests 与独立的 Playwright E2E
- GitHub Pages 静态部署

## 目标方向

- Astro 继续负责路由、内容、SEO 和静态 HTML。
- Vue 3 只用于导航、搜索、首页时间线等局部交互群岛。
- Tailwind CSS 4 负责语义 token 与常规 utilities，迁移期关闭 Preflight。
- shadcn-vue 只提供按需、源码归仓库所有的可访问 UI 原语。
- 终端、头像框、头像、吉他、樱花、下落标签和首页 blocks 保持独立领域组件，可通过 preset、manifest 或替换 component 自由 DIY。
- pnpm 是唯一包管理器，支持版本 `>=11.28.4 <13`（11/12）；项目内固定 Vite+ 0.3.3 作为 `install/run` 控制面，Astro 仍是构建真源。
- Node 支持 LTS 22/24，兼容范围为 `^22.18.0 || ^24.11.0`；`.node-version` 和 CI 默认选择 Node 24。请使用所在 LTS major 的最新安全补丁。其他 direct dependencies 使用经过 compatibility 与 security review 的 stable release，并由 exact version 与唯一 lockfile 固定。

shadcn-vue 配置与导航所需的源码组件已接入。当前依赖以 `package.json` 与 `pnpm-lock.yaml` 为准。

## 当前本地开发

```bash
pnpm install --frozen-lockfile
pnpm run dev:bg
```

后台服务器管理：

```bash
pnpm run dev:status
pnpm run dev:logs
pnpm run dev:stop
```

检查、构建与测试：

```bash
pnpm run check
pnpm run lint
pnpm run content:report
pnpm run content:check
pnpm run test:unit
pnpm run build
pnpm run test:e2e
pnpm run verify
```

`content:report` 用于查看 Markdown/frontmatter 诊断；`content:check` 将同一规则作为失败门禁，静态构建会先执行它。文章 metadata 缺失、代码块格式错误或引用的本地图片不存在时，应修正源内容，不使用构建时默认值掩盖问题。

已安装全局 `vp` 时可运行 `vp install --frozen-lockfile` 和 `vp run <script>`；不安装全局 CLI 也可使用 `pnpm exec vp run <script>`。两者执行项目内固定的 Vite+ 0.3.3，`vp install` 根据 `devEngines.packageManager` 选择兼容的 pnpm。禁止用内建 `vp dev` / `vp build` 替代 Astro scripts；构建使用 `vp run build`。

## 内容与资源

```text
src/content/blog/        Markdown 技术文章
src/assets/blog-covers/  构建优化的文章封面
public/images/           运行时公共图片与图标
src/pages/               Astro 文件路由
src/components/          静态组件与 UI 原语
src/islands/             Vue 群岛目录
src/styles/prose/         文章正文局部样式
src/styles/foundation/    跨页面的语义 token 与共享静态表面
src/presets/moyue/        Moyue 首页组合与签名样式
```

Markdown 是默认文章格式。只有真实文章需求无法由 Markdown 插件表达时，才单独评估 MDX。

友链头像可使用站点自有的 `/images/` 文件或外部 HTTPS URL。外部资源由浏览器直连，使用 `no-referrer`，不会由构建程序代理或静默替换；链接失效时应在 site 数据中更新来源。

当前图片的来源与再分发状态见 [ASSETS.md](ASSETS.md)。中性 preset 和第二站点 fixture 不包含 Moyue 素材。

## 架构文档

公开、版本化的架构事实源只有：

- [`docs/architecture.md`](docs/architecture.md)

`docs/` 下其他文件是本地 Agent 工作簿，由 `.gitignore` 排除。项目构建、测试、贡献和公共 API 不得依赖它们。
