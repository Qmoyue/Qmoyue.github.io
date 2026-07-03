# moyue's blog

一个使用 Astro 构建的个人博客，整体风格是明亮、柔和、偏二次元手账感的静态站点。项目主要用于记录学习笔记、小想法、CTF/开发相关内容，以及个人页面、项目页和友链页。

## 技术栈

- Astro
- TypeScript
- 原生 CSS
- 原生 JavaScript
- Astro Content Collections

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run astro -- dev --background
```

查看或停止后台开发服务器：

```bash
npm run astro -- dev status
npm run astro -- dev stop
```

构建与测试：

```bash
npm run build
npm run test:e2e
```

## 内容结构

```text
src/content/blog/        # 博客文章，支持 .md 和 .mdx
src/assets/blog-covers/  # 博客封面候选库
public/images/           # 站点固定图片，如头像、背景、doro、图标
src/pages/               # 页面路由
src/components/          # Astro 组件
src/scripts/             # 页面交互脚本
src/styles/global.css    # 全局样式
src/data/                # 站点配置、友链、项目、兴趣等数据
```

新增博客文章时，把 Markdown 或 MDX 文件放进 `src/content/blog/`。新增封面候选图时，把图片放进 `src/assets/blog-covers/`，构建时会自动纳入封面分配逻辑。
