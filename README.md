<div align="center">

# Hx · 图片分享社区

浏览喜欢的图片，发现作者，留下关注、点赞与评论。

![Vue 3](https://img.shields.io/badge/Vue%203-42b883?style=flat-square) ![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square) ![Element Plus](https://img.shields.io/badge/Element%20Plus-409eff?style=flat-square)

</div>

---

<p align="center"><a href="https://github.com/wek486/hx.h">配套后端</a> · <a href="./GITHUB-PAGES.md">部署指南</a> · <a href="./FOLLOW-NOTES.md">关注功能说明</a></p>

## 界面预览

<p align="center"><img src="https://github.com/user-attachments/assets/fb42a015-2456-4b1e-bf2d-35bb8717e881" alt="Hx 图片分享网站现有项目截图" width="960"></p>

## 主要功能

| 模块 | 内容 |
| --- | --- |
| 图片发现 | 图片列表、搜索与图片预览 |
| 社交互动 | 关注作者、点赞作品与评论 |
| 个人空间 | 个人主页、最近互动、账号资料与头像 |
| 账号流程 | 登录、注册、退出与密码修改 |
| 评论管理 | 管理员审核入口，与后端权限配合 |

## 本地启动

Node.js 要求：`^22.18.0 || >=24.12.0`，与 `package.json` 保持一致。

```sh
git clone https://github.com/wek486/Hx.git
cd Hx
npm install
npm run dev
```

本地开发通过 `/api` 代理到 `http://localhost:8080`，转发时移除 `/api` 前缀。请同时启动 [hx.h 后端](https://github.com/wek486/hx.h) 并配置数据库；仅启动前端无法完成图片加载、登录和互动。

```sh
npm run build
npm run preview
```

以上为仓库脚本与配置对应的操作，本次文档整理未重新构建应用。

## 项目结构

| 位置 | 职责 |
| --- | --- |
| `src/views/` | 发现、搜索、账号与设置等页面 |
| `src/components/` | 图片预览、评论、点赞等组件 |
| `src/api/` | 账号、搜索与社交接口 |
| `src/stores/` | 关注和点赞状态 |
| `src/utils/router/` | 路由配置 |
| `src/utils/axios/` | 请求与媒体地址处理 |
| `src/layout/` | 导航和页面框架 |

## 部署

参考 [.env.example](./.env.example) 与 [GitHub Pages 部署指南](./GITHUB-PAGES.md)。Pages 只运行静态前端，需要另行提供可访问的 HTTPS 后端。公开的 `VITE_API_BASE_URL` 用于 API 地址配置。

工作流适配 Pages 子路径并使用 hash 路由；本地开发使用 history 路由。前端地址与后端 CORS 配置需要一致。
