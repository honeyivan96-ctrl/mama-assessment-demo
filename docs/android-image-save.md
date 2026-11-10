# 安卓小红书内置浏览器保存说明

有些内置浏览器不提供图片长按菜单或下载支持，H5无法强制写入Android相册。增加独立保存页及同步用户点击触发的Android VIEW/BROWSABLE intent，尝试交给系统浏览器。不绑定Chrome包名，支持国产手机默认浏览器；宿主拒绝跳转时明确提供复制保存链接的手动路径。

独立保存页使用真实HTTPS PNG/附件链接，点击下载，不要求长按图片；说明下载列表、Download目录与相册自动索引的区别。保存链接通过URL片段携带签名图片URL，页面请求不将该参数发给静态站点；不接受任意外站、data、blob或javascript图片地址。不把跳转或请求下载表述为已保存到相册。

依据：[Chrome Android intents官方文档](https://developer.chrome.com/docs/android/intents)。测试覆盖intent/fallback、无Chrome依赖、图片URL白名单、独立页面下载及复制提示、原问卷和图片生成回归。未具备实体安卓小红书环境，不能声称已验证宿主允许跳转或相册落盘。
