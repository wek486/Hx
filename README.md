<div align="center">

# Hx · 图片分享社区

用 Vue 3 和 Spring Boot 搭建的图片社区。浏览二次元插画与 Cosplay 作品，发现作者，留下关注、点赞和评论。

**[在线体验](https://wek486.github.io/Hx/#/find)** · **[配套后端](https://github.com/wek486/hx.h)** · **[本地启动](#本地启动)** · **[部署指南](./GITHUB-PAGES.md)**

![Vue 3](https://img.shields.io/badge/Vue%203-42b883?style=flat-square) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat-square) ![MyBatis](https://img.shields.io/badge/MyBatis-BF3C32?style=flat-square) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square)

<a href="https://wek486.github.io/Hx/#/find"><img src="https://github.com/user-attachments/assets/fb42a015-2456-4b1e-bf2d-35bb8717e881" alt="Hx 图片社区的发现页截图，点击打开在线体验" width="960"></a>

</div>

## 可以体验什么

- **浏览作品**。按分类和推荐、最新、热门排序浏览图片，支持搜索和大图预览。在线体验无需登录即可浏览。
- **与作者和作品互动**。登录后可以关注作者、点赞图片、发表评论，并在个人页查看互动记录。
- **管理账号与评论**。用户可以修改资料和头像，管理员可以审核待公开的评论。[关注、点赞与评论说明](./FOLLOW-NOTES.md)

如果 Hx 对你有参考价值，欢迎点个 Star，方便下次回来找。遇到问题或有功能建议，可以到 [Issues](https://github.com/wek486/Hx/issues) 留下页面、复现步骤或截图。

## 本地启动

| 部分 | 环境与说明 |
| --- | --- |
| 前端 · 本仓库 | Node.js `22.18.0` 及以上的 22.x 版本，或 `24.12.0` 及以上版本。使用 Vue 3、Vite 和 Element Plus |
| 后端 · [hx.h](https://github.com/wek486/hx.h) | JDK 17、Maven、MySQL，使用 Spring Boot 和 MyBatis |

1. 按 [后端 README](https://github.com/wek486/hx.h#本地运行) 准备数据库和图片数据，再启动后端。前端开发代理默认将 `/api` 请求转发到 `http://localhost:8080`。
2. 启动前端，并在浏览器打开终端显示的地址。

   ```sh
   git clone https://github.com/wek486/Hx.git
   cd Hx
   npm install
   npm run dev
   ```

图片列表、登录和社交互动依赖后端和数据库。本地想先看界面，可以打开上方在线体验。

## 项目结构

| 目录 | 负责内容 |
| --- | --- |
| `src/views/`、`src/layout/` | 发现、搜索、账号等页面与导航布局 |
| `src/components/` | 图片预览、点赞和评论等组件 |
| `src/api/`、`src/stores/` | 业务接口与关注、点赞状态 |
| `src/utils/router/`、`src/utils/axios/` | 页面路由、接口请求与媒体地址 |

## 构建与部署

```sh
npm run build
npm run preview
```

GitHub Pages 托管静态前端。部署时通过 `VITE_API_BASE_URL` 指向可公开访问的 HTTPS 后端，并让后端允许 Pages 来源跨域访问。Pages 使用 hash 路由，本地开发使用 history 路由。配置步骤见 [环境变量示例](./.env.example) 和 [部署指南](./GITHUB-PAGES.md)。
