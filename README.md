# KUSARIUM

**クサの植物標本園** — 图像与文字，在这里缓慢生长。

这是一套为 `https://kusarium.github.io` 制作的无广告个人图文站。它会自动生成首页、插画图鉴、生长日志、标签索引、年月归档、RSS 和站点地图。

## 第一次发布

1. 解压下载到的 `kusarium-site.zip`。
2. 打开 GitHub 中的 `kusarium/kusarium.github.io` 仓库。
3. 选择 **Add file → Upload files**，上传解压后 `kusarium-site` 文件夹里面的全部内容。不要只上传 ZIP 文件。
4. 提交时填写 `Install KUSARIUM site`，点击 **Commit changes**。
5. 打开仓库的 **Settings → Pages**。
6. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
7. 打开仓库顶部的 **Actions**，等待 `Build and deploy KUSARIUM` 显示绿色对勾。
8. 访问 `https://kusarium.github.io`。

如果网页暂时没有出现，等待几分钟后刷新。首次发布有时需要约十分钟。

## 修改站名和说明

编辑：

```text
src/_data/site.json
```

其中可以修改作者名、首页短句、网站介绍和版权声明。

园丁室的正文位于：

```text
src/about.njk
```

找到示例文字后直接替换即可。

## 发布一篇新文章

### 1. 上传图片

进入：

```text
src/assets/images/posts/
```

选择 **Add file → Upload files** 上传图片。建议：

- 展示图使用 WebP 或 JPEG。
- 长边约 1600–2400px。
- 单张尽量控制在 1MB 以内。
- 文件名使用小写英文、数字和连字符，例如 `2026-08-night-flower.webp`。

原始大图请继续保存在电脑和云盘；网站不是原稿备份。

### 2. 新建文章

打开根目录的 `POST_TEMPLATE.md`，复制全文。然后进入：

```text
src/posts/
```

选择 **Add file → Create new file**，文件名使用：

```text
YYYY-MM-DD-英文短标题.md
```

例如：

```text
2026-08-18-summer-leaves.md
```

粘贴模板，修改标题、日期、摘要、封面路径、标签和正文，最后点击 **Commit changes**。几分钟后网站会自动更新。

## 文章开头各项的作用

```yaml
title: "文章标题"
date: 2026-08-10T12:00:00+09:00
excerpt: "列表摘要"
cover: "/assets/images/posts/image.webp"
coverAlt: "图片内容描述"
coverCaption: "图片说明"
topics:
  - 插画
  - 原创
draft: false
```

- `cover` 存在时，文章会自动进入“图鉴”。
- `topics` 可以添加任意数量的中文或日文标签。
- `draft: true` 会隐藏文章，改回 `false` 才会发布。
- 不使用封面时，删除三个 `cover` 相关字段。

## 删除示例文章

发布成功并熟悉操作后，可以删除：

```text
src/posts/2026-08-08-field-note.md
src/posts/2026-08-09-night-greenhouse.md
src/posts/2026-08-10-welcome.md
```

也可以先保留其中一篇，直接修改成自己的内容。

## 在电脑上预览（可选）

安装 Node.js 后，在项目文件夹运行：

```bash
npm install
npm run dev
```

平时只通过 GitHub 网页更新，并不需要执行这些命令。

## 色卡

| 用途 | 色值 |
| --- | --- |
| 水气与植物 | `#abd9cf` |
| 柔和的光 | `#feebbe` |
| 雾与纸张 | `#efefef` |
| 分隔线 | `#d3d3d4` |
| 次要文字 | `#949495` / `#727171` |
| 正文与夜色 | `#4c4948` |

主要样式位于 `src/assets/css/style.css`。

## 版权提醒

公开网页中的图片始终可能被访客保存。版权声明和 `robots.txt` 可以表达使用意愿，但无法从技术上保证阻止转载、抓取或 AI 训练。
