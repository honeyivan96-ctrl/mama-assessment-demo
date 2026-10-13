# 动物妈妈测评：静态前端 + Supabase

当前迁移版本已准备，尚未连接用户GitHub、Supabase与正式前端托管账号，因此还未在这些平台上线。

## 两个版本

### 免费演示版 / GitHub Pages

- 构建：`npm run build:demo`。
- 不收费、无需密码、没有好评返现或店铺管理入口。
- 在浏览器本地完成16题与解读，不提交答题内容到Supabase。
- 分享链接使用 `#result=demo_...`，包含明确分享的演示答案与生成时间，不依赖服务器。
- GitHub Actions工作流 `.github/workflows/demo-pages.yml` 自动处理仓库子路径。
- 需要在GitHub仓库Settings → Pages中选择GitHub Actions。

### 收费正式版 / 独立商用前端托管 + Supabase

- 构建：`npm run build`。
- 密码、次数、正式结果和店铺设置存在Supabase数据库。
- 管理地址为正式前端网址加 `#admin`。
- 正式结果地址为正式前端网址加 `#result=结果ID`，不需测评密码查看。
- 静态哈希路由避免Pages/Netlify刷新结果链接时404。
- 同一密码3次。成功生成报告才扣一次；数据库事务锁定同一密码，防止超额或重复扣次。
- 正式版计分与题目由服务端提供，不在正式前端构建中携带题目计分数据。

## 安装与配置

需要Node.js >=22.13。

```sh
npm ci
npm test
npm run build:demo
```

正式前端需要设置公开环境变量：

```text
VITE_APP_MODE=production
VITE_BASE_PATH=/
VITE_API_URL=https://你的项目ID.supabase.co/functions/v1/mama-api
VITE_SUPABASE_PUBLISHABLE_KEY=公开publishable key
```

前端不能使用service-role/secret key、管理密码或APP_SECRET。
Netlify可直接导入GitHub仓库，构建配置在 `netlify.toml`。部署后确认项目访问权限为公开。

## Supabase部署

1. 在用户账号下创建或选择一个项目，建议专门用于此测评。
2. 应用 `supabase/migrations/202610130001_mama_assessment.sql`。
3. 在Supabase Edge Function Secrets设置：
   - `APP_SECRET`：至少32字符的随机密钥，迁移旧密码时必须保留原密钥。
   - `ADMIN_PASSWORD`：至少16字符的管理员密码。
   - `ALLOWED_ORIGINS`：正式前端的精确origin，例如 `https://你的站点.netlify.app`。多个值用逗号分隔，不允许 `*`。
4. 部署函数 `mama-api`。`verify_jwt=false` 是因为此应用使用自己验证的随机会话token，每条受保护接口都进行服务器验证，并非取消应用认证。
5. Supabase注入 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`；这些值只能用于服务端。
6. 登录正式前端 `#admin`，设置店铺与客服，生成并导出正式密码。

可使用连接的Supabase管理工具执行部署，或官方CLI。CLI登录必须由账号所有者完成。
备用手动GitHub Actions工作流 `supabase.yml` 需要在GitHub生产环境安全配置对应账号凭据，首次数据库与项目选择应先确认；此工作流不会自动购买服务。

## 数据与安全

- 所有7张表启用RLS；浏览器anon/authenticated角色不能直接读写表。
- 事务RPC只授权service_role，不能用公开key直接扣次或伪造报告。
- 密码仅保存带APP_SECRET的HMAC哈希，密码原文只在生成时返回。
- 登录令牌放在当前标签页的sessionStorage，服务端只保存哈希。刷新可继续；关闭标签页后需要重新验证。
- 跨域请求使用自定义认证头，不依赖第三方Cookie。
- 前端来源使用精确CORS白名单；过期、停用与次数由服务端验证。
- 所有旧密钥、旧数据库与迁移数据均不得提交到GitHub。

## 验收

`npm test` 使用嵌入式PostgreSQL检验迁移、权限、事务回滚与配额，并检验Edge API的来源校验、认证、服务端计分和免费演示分享。
嵌入式PG串行处理，并发多连接行为还需在Supabase线上验收。
部署后还需实测16题、返回修改、长图下载、复制分享、密码耗尽与管理页，并在实际手机网络访问两个地址。

## 持续可访问

完成线上部署后不依赖本地电脑开机。
Supabase免费项目低活跃7天可能暂停；正式收费业务若要求避免因不活跃暂停，应由用户自行选择合适的付费套餐。Netlify免费用量耗尽也可能暂停，需要按实际业务选择套餐。不会擅自升级或付款。

问卷属于趣味自我探索，原创分类尚未经心理测量验证。
