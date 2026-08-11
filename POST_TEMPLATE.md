---
title: "文章標題"
date: 2026-08-10T12:00:00+09:00
language: zh-Hans
section: journal
excerpt: "顯示在首頁和生長記列表中的簡短介紹。"
showToc: true
tocTitle: "本文目錄"
passwordProtected: false
passwordHint: ""
password: ""
coverCard:
  template: night
  eyebrow: "KUSARIUM · ARCHIVE CARD"
  title: "封面主標"
  subtitle: "封面副標"
  note: "FIELD NOTE"
  number: "001 / 2026"
cover: "/assets/images/posts/your-image.webp"
coverAlt: "請用一句話描述圖片內容，方便使用讀屏軟體的訪客"
coverCaption: "可選的圖片說明"
topics:
  - 插畫
  - 原創
draft: false
---

從這裡開始寫正文。

空一行就會形成新的段落。你也可以使用：

## 二級標題

### 三級標題

- 列表項目
- 另一個項目

> 引用或想特別留下一句話。

不需要封面圖片時，刪除 `cover`、`coverAlt` 與 `coverCaption` 三行即可。

不需要文字封面時，刪除整段 `coverCard`。如果文字封面與封面圖片同時存在，網站會優先顯示圖片。

簡體文章使用 `language: zh-Hans`，繁體文章使用 `language: zh-Hant`。

暫時不想公開時，把 `draft: false` 改成 `draft: true`。

`showToc: true` 會把二級、三級標題自動放進本文目錄。若不需要目錄，改成 `false`。

普通文章需要密碼時，把 `passwordProtected` 改成 `true`，並填寫 `passwordHint` 和 `password`。

翻譯內容放進地下室時，把 `section: journal` 改成 `section: basement`。留空單篇密碼時，會沿用 CMS「站點資料 → 地下室設定」中的密碼。
