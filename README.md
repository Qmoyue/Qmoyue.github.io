# moyue's blog / Certain Cloud

个人静态博客，记录技术笔记、项目和兴趣。Astro 生成页面，Vue 群岛处理浏览器交互。页面由独立模块组成，可以直接修改组件、内容和样式。

## 本地开发

Node.js 与 pnpm 的兼容范围见 `package.json`。

```bash
pnpm install --frozen-lockfile
pnpm run dev:bg
```

使用 `pnpm run dev:status`、`pnpm run dev:logs`、`pnpm run dev:stop` 管理开发服务器。构建命令是 `pnpm run build`；其他检查见 `package.json`。

## 目录

| 路径                              | 内容                         |
| --------------------------------- | ---------------------------- |
| `src/pages/`、`src/layouts/`      | 路由与页面外壳               |
| `src/components/`、`src/islands/` | 静态组件与 Vue 组件          |
| `src/presets/moyue/`              | 本站主题与首页模块组合       |
| `src/site/`、`src/content/blog/`  | 站点资料与文章               |
| `src/domain/`、`src/framework/`   | 文章处理、内部类型与辅助函数 |
| `src/assets/`、`public/images/`   | 图片资源                     |

结构见 [架构文档](docs/architecture.md)，开发约定见 [AGENTS.md](AGENTS.md)，素材记录见 [ASSETS.md](ASSETS.md)。
