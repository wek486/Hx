# GitHub Pages 部署

此目录是独立的前端项目，部署工作流假设 package.json 位于仓库根目录。只将此目录作为前端仓库上传；后端配置、数据库密码及 JWT 密钥不应放入前端仓库。

1. 提供或创建 GitHub 前端仓库，将本目录代码推送到 main 分支。node_modules 和 dist 已被忽略。
2. 打开仓库 Settings → Pages → Build and deployment → Source，选择 GitHub Actions。
3. 若后端已有公网HTTPS地址，在 Settings → Secrets and variables → Actions → Variables 中新增 VITE_API_BASE_URL，例如 https://api.example.com。这里应为后端对外接口根地址；如果反向代理保留 /api，则填 https://api.example.com/api。
4. 在 Actions 中运行 Deploy frontend to GitHub Pages，或推送main触发。部署成功后的 page_url 才是可分享地址。

Pages 只托管静态前端，不能运行Spring Boot、MySQL或开发代理。没有公网后端时只能看到前端界面，图片、登录及互动接口不会正常工作。localhost和127.0.0.1不能作为供其他人使用的后端地址。

工作流通过GitHub Pages的base_path适配仓库子目录，路由切换为hash模式（如 /Hx/#/find），避免静态托管刷新子页面404。本地开发仍使用原来的history路由和 /api 代理。生产后端需要允许准确的Pages页面来源通过CORS访问（来源是 https://用户名.github.io，不包含仓库路径），并允许 Authorization 请求头以及GET、POST、PUT、DELETE、PATCH、OPTIONS。跨域OPTIONS预检必须在JWT拦截前由正确的CORS配置处理。

头像接口在后端返回 /api/account/avatars/...，前端会按VITE_API_BASE_URL改写为公网接口地址。VITE_变量会编译进公开的前端文件，只能放公开地址，不能放密码、API私钥或JWT_SECRET。

所有修改前的文件已在本地工作区 hx-pages-backup-* 中备份。本文件不表示已经发布；必须确认目标仓库并完成GitHub Actions运行后，才有公网访问地址。
