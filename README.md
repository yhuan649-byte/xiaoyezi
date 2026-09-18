# 萌叶幻想物语 · 手机部署说明

## 网站文件

网站只需要同一文件夹内的三个文件：

- index.html：入口与导航。
- style.css：全部样式、手机布局。
- app.js：四组角色资料、五种界面、搜索、收藏、切换与音效。

README.md 是说明，不影响运行。无需安装 Node.js、运行命令或购买服务器。

## 五个界面

首页 #home；角色图鉴 #gallery；详情 #character/haanye（每位角色各有链接）；世界观 #world；收藏 #favorites。
采用井号路由，GitHub Pages 项目子目录可用，分享详情链接和刷新无需配置服务器。

## 只用手机部署 GitHub Pages

1. 下载 ZIP，在手机文件管理器里解压。GitHub 不会自动解压上传的 ZIP，所以不要仅上传压缩包。
2. 用手机浏览器登录 github.com。操作按钮看不到时，在浏览器菜单切换“桌面版网站”。
3. 新建一个 Public（公开）仓库，例如 aetheria，勾选添加 README，完成创建。
4. 仓库 Code 页面，选择 Add file → Upload files。上传解压得到的 index.html、style.css、app.js，再点 Commit changes 提交。
5. 确认打开仓库就能看到这三个文件，不要把它们放进额外的 aetheria 子文件夹。
6. 进入仓库 Settings → Pages。在 Build and deployment 中，Source 选择 Deploy from a branch，Branch 选择 main，目录选择 / (root)，点击 Save。
7. 等待部署完成，回到 Pages 页面打开显示的网站地址。一般为 https://你的用户名.github.io/aetheria/，以 GitHub 实际显示的链接为准。
8. 更新时编辑并提交对应文件即可。部署状态可在 Actions 查看，手机显示旧内容时刷新页面或清除该站点缓存。

如果手机不能上传文件：在仓库选择 Add file → Create new file，依次按准确文件名新建三个文件，从“完整源码.md”复制对应代码并提交。复制代码块内部内容，不要复制外面的三个反引号。文件名保持小写，不要自动加 .txt。

GitHub 官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 修改内容

打开 app.js，最前面的 characters 数组保存角色。name 是中文名，en 是英文名，quote 是短句，story 是物语，image 是图片地址。id 必须唯一，group 填 forest 或 cats。新增角色会自动出现在图鉴、收藏计数与切换队列中；世界观页面的地点与入口可在 world() 内单独修改。

世界观中的四个地点和文案是这次新增的设定，可自由改动。原有四组角色资料与图片链接保持不变。

更换配色：编辑 style.css 第一行的 --green、--bg、--ink。

## 图片与使用说明

- 沿用原代码中的外部图片地址。能否显示取决于图床可用性与访问限制；加载失败会显示文字提示。
- 若要自己管理图片，可在仓库新建 images 文件夹并上传原图，将 image 改成 ./images/haanye.webp 等相对路径。
- 收藏存于当前浏览器 localStorage，不同手机或浏览器不会自动同步，清除网站数据会移除收藏。
- 音效默认关闭，由右上角按钮手动开启。角色详情纵向滑动只滚动内容；左右扫立绘或点按钮切换；返回使用导航或返回图鉴按钮。
- 此版未保留陀螺仪、摇一摇和循环粒子动画，减少权限弹窗、误触与手机耗电；保留柔光背景、卡片流光、完整立绘与合成音效。
- 双指缩放未被禁用，支持键盘操作与系统减少动态效果设置。
