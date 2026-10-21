# 关注、点赞与评论

## 已接入

- 原有 acg、user 表保留。新增 hx_author、hx_image、hx_follow、hx_like、hx_comment 五张表。
- 启动时 SocialSchema 执行幂等建表，并从 acg 建立作者、图片目录。图片按 URL 的 SHA-256 去重，作者按当前作者名的 SHA-256 去重，不创建可登录账号。同名作者暂无法区分，后续应补充来源站点及来源作者 ID。
- 图片查询返回 id、authorId、authorUserId、avatarUrl 和实时点赞数。没有头像时仍显示文字头像。
- 图片点赞数为原有 acg.likes 历史基数加本站 hx_like 关系数，不修改历史点赞数。点赞/关注的 PUT 和 DELETE 均可重复调用。
- 当前操作者只从验证签名和有效期后的 JWT subject 获取，账号存在性也会检查。登录服务不再保留共享 token。
- 未登录可读取作品、搜索和已审核评论；个人列表和所有写入需要登录。

## 评论审核

- 所有评论均为 PENDING，审核通过 APPROVED 后才公开；REJECTED 为拒绝。本人可看到自己的三种状态，其他用户只看到已通过评论。
- 仅本人可删除评论。每账号10秒最多发布一条，内容长度1～500。评论按纯文本渲染。
- werrr 在 application.properties 的 social.admin-usernames 中被指定为审核管理员。登录后侧栏显示“评论审核”，路径 /review。接口独立检查权限，隐藏按钮并非权限边界。
- 可通过 SOCIAL_SENSITIVE_WORDS 环境变量设置逗号分隔的初筛词库。命中词库只标注给管理员，不自动判定违规；未配置词库时仍全部人工审核，不自动公开。
- 此版本不包含商业内容审核服务。词库不保证识别谐音、变体或语义风险，不替代人工审核。

## 接口（响应保持 code/msg/data 格式）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /social/me/follows?page=1&size=100 | 当前用户关注作者 |
| PUT / DELETE | /social/authors/{id}/follow | 关注 / 取消关注 |
| GET | /social/me/likes?page=1&size=100 | 当前用户点赞作品 |
| PUT / DELETE | /social/images/{id}/like | 点赞 / 取消，返回最新计数 |
| GET | /social/images/{id}/comments?page=1&size=20&sort=newest | 公开评论及本人评论 |
| POST | /social/images/{id}/comments | JSON: {"content":"..."} |
| DELETE | /social/comments/{id} | 删除本人评论 |
| GET | /social/me/permissions | 当前账号是否管理员 |
| GET | /social/admin/comments?page=1&size=20 | 待审核队列 |
| PATCH | /social/admin/comments/{id} | JSON: {"status":"APPROVED"} 或 REJECTED |

列表每页最多100条。受保护请求使用 Authorization: Bearer <JWT>。无效凭据返回401，非管理员审核返回403，评论发布太频繁返回429。

## 运行与数据

- 保持原有数据库连接和 JWT_SECRET。IDEA 已有的 JWT_SECRET 不会自动传给其他终端，请在终端或运行配置中明确设置，不要把密钥写进代码。
- 后端默认8080，前端5173。每次后端改动需重新运行；表结构脚本由启动初始化执行。
- 旧浏览器本机关注、点赞、评论记录不会自动迁入数据库，避免把未验证的客户端记录当作真实公共数据。原本机记录仍保存在浏览器，当前页面不再读取。
- SocialIntegrationTest 通过随机端口验证登录、账号隔离、点赞/关注幂等、待审核隔离、审核权限、公开展示、删除权限及发布频率。它使用配置中的数据库，创建随机临时账号和评论，并在 finally 中仅清理这些测试账号对应数据。建议持续集成中指定单独测试库。
- 不要删除 hx_image/hx_author 目录表重建，否则会改变已有关系引用的 ID。新增导入会同步目录；更新 URL 会被当作新图片，后续可按原始作品来源 ID 改善映射。
