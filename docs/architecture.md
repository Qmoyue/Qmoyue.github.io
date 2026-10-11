# 架构

本站是 Astro 静态博客。路由、文章和页面外壳由 Astro 构建；需要浏览器状态的模块使用 Vue 群岛。页面按模块组合，修改一个模块时可以直接定位到它的组件、内容和样式。

## 模块与目录

| 路径                          | 职责                                    |
| ----------------------------- | --------------------------------------- |
| `src/pages/`                  | Astro 文件路由，读取内容并组合页面      |
| `src/layouts/`                | 页面外壳、导航、页脚与元数据            |
| `src/components/`             | 静态展示组件和 UI 原语                  |
| `src/islands/`                | Vue 模块与浏览器交互                    |
| `src/presets/moyue/`          | 本站主题、首页场景和模块布局            |
| `src/site/`                   | 站点身份、导航、首页文案、项目与友链    |
| `src/content/`、`src/domain/` | 文章 schema、查询和页面数据处理         |
| `src/framework/`              | 项目内部的类型、配置校验和 SEO 辅助函数 |

首页由 `src/pages/index.astro` 传入真实内容，`HomeExperience.vue` 作为 Vue 群岛管理两屏切换与开场状态。场景和各块组件分别负责自己的画面；共享状态由最近的组合组件或 composable 管理。其他页面以 Astro 静态组件为主，在导航、搜索、目录和阅读进度等交互处加载 Vue。

## 内容与样式

文章位于 `src/content/blog/`，由 `src/content.config.ts` 定义格式，`src/domain/blog/` 负责查询。站点资料放在 `src/site/`，图片放在 `src/assets/` 或 `public/images/`。

跨页面基础样式位于 `src/styles/foundation/`，Moyue 配色位于 `src/presets/moyue/theme.css`。页面级样式处理布局与模块间距，模块独有的结构、样式和交互随组件维护。
