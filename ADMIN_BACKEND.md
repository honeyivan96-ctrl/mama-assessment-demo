# 妈妈测评管理后台（10题版）

前台：https://honeyivan96-ctrl.github.io/mama-assessment-demo/
后台：https://honeyivan96-ctrl.github.io/mama-assessment-demo/admin.html

## 使用
- 管理员使用 Supabase 项目里已设置的 ADMIN_PASSWORD 登录，8小时后需重新登录。
- 每批生成1至100个密码，可备注批次、复制或下载CSV。明文只在本次生成时显示，数据库仅保存HMAC哈希及尾号。
- 每个密码成功保存结果后扣一次，总共3次；重复提交同一答卷不会重复扣次。
- 问卷与结论中可查看基础信息、育儿观念和困扰、10题原始选项、当时题目快照、五维刻度和报告文字，并导出本页CSV。
- 系统验收记录标有“非真实用户”，验收密码已停用。
- 用户开始前须知晓并同意答题数据保存。姓名、手机号无需填写。
- 分享链接仅展示报告，不开放原始选项、前置信息或密码。

## 技术配置
- site/ 是当前发布目录；原16题源码保留，但当前Pages发布的是10题版。
- Supabase项目 apqqdkooiezejwyypwht；Edge Function mama-v2。
- supabase/functions/mama-v2/ 为当前后台源码；supabase/schema/mama_v2_submission_records.sql 为新增表及事务函数定义。
- 服务端沿用 APP_SECRET、ADMIN_PASSWORD、SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY、ALLOWED_ORIGINS。密钥不进入浏览器或Git。
- 所有表启用RLS；匿名用户不能直接读取数据库。管理员接口验证随机会话令牌。
- 原mama-api保留以兼容旧服务。mama-v2使用独立答卷记录表和新版事务函数。
