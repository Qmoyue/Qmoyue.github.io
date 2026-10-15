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

首页由 `src/pages/index.astro` 传入真实内容，`HomeExperience.vue` 作为 Vue 群岛管理两屏切换，开场状态归 `HomeOpeningSequence.vue` 管理。场景和各块组件分别负责自己的画面；共享状态由最近的组合组件或 composable 管理。其他页面以 Astro 静态组件为主，在导航、搜索、目录和阅读进度等交互处加载 Vue。

## 组合与 DIY

| 要修改的部分 | 组合入口                                           | 模块与状态归属                                                                                                                                    |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 页面外壳     | `src/layouts/BaseLayout.astro`                     | `PageHead` 管元数据，`DropdownNav` 接收导航数据；`effects`、`navigation`、`progress`、`footer` 命名插槽可以直接替换对应区域，默认插槽放页面主体。 |
| 首页首屏     | `src/islands/home/opening/HomeOpeningSequence.vue` | 开场时间线和终端播放在此创建、取消；`AvatarStage` 管留言，`IdentityTerminal` 展示终端。                                                           |
| 首页第二屏   | `src/presets/moyue/HomeBentoGrid.vue`              | 在这里排列人像、签名、个人介绍、快捷入口和时间区域；各模块接收自身需要的 props。                                                                  |
| 时钟与日历   | `src/islands/home/blocks/HomeTimeColumn.vue`       | 一个时间源同时传给时钟、日历；两者按 Asia/Shanghai 显示，静态构建与水合使用同一时区。                                                             |
| 滚动条       | `src/components/navigation/ScrollRail.vue`         | 共享外观、指针捕获和键盘输入；`ReadingProgress` 负责文档高度与阅读进度，首页由 `useHomePanels` 负责两屏定位。                                     |
| 文章         | `src/pages/blog/[...id].astro`                     | 路由查询、渲染 Markdown，再组合 `ArticleCard`、`ArticleHeader`、`ArticleToc`；文章容器的 `header` 插槽与正文插槽可独立组合。                      |
| 特效         | `SakuraField.astro`、`FallingTags.vue`             | 樱花由 CSS 动画驱动；掉落词只接收 `active` 和 `words`，自己管理物理世界与清理，不依赖首页切屏类型。                                               |

重排现有模块时先修改对应组合入口，不要把模块的计时器、DOM 查询或内部样式搬进页面。彼此相关的 Vue 子组件共用所属群岛；静态页面模块继续使用 Astro，无需为每块静态内容启动 Vue。

例如，某页可以在 `BaseLayout` 内传入 `<SiteFooter slot="footer" ... />` 替换页脚；首页快捷入口从 `src/site/config.ts` 的导航传入，修改路径不需要再改一份组件内的链接表。首页桌面快捷入口的四个位置由 `quick-links.css` 对应章鱼图案定义；改变入口数量时，应一并修改该模块的定位样式。

## 内容与样式

文章位于 `src/content/blog/`，由 `src/content.config.ts` 定义格式，`src/domain/blog/` 负责查询。站点资料放在 `src/site/`，图片放在 `src/assets/` 或 `public/images/`。

跨页面基础样式位于 `src/styles/foundation/`，Moyue 配色位于 `src/presets/moyue/theme.css`。页面级样式处理布局与模块间距，模块独有的结构、样式和交互随组件维护。

首页开场、头像、终端、时钟、日历、介绍、快捷入口及掉落词的 CSS 位于各自组件目录；`home.css` 与 `home-second.css` 仅管理页面背景和区域组合布局。保留现有类名与 CSS 声明值，避免重排组件时把主题样式复制到多处。

文章元数据的唯一契约是 `src/domain/blog/metadata.ts`，内容集合与 `content:check` 共用它。`pubDate` 和可选 `updatedDate` 必须是有效的 `YYYY-MM-DD`，更新日期不能早于发布日期；文章日期按 UTC 日历日显示，不随构建机时区漂移。缺失内容与无效资源由构建检查直接报错。
