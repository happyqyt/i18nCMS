# i18n Git Demo

在浏览器里用 **Vite + Vue 3 + isomorphic-git + LightningFS** 操作 Git，验证 i18n CMS 的「文案管理 + 版本管理」能否交给 Git 引擎。

目录与 `i18nCMS-v3` 同级：`DESIGN/i18n-git-demo`。

## 启动

```sh
cd DESIGN/i18n-git-demo
npm install
npm run dev
```

默认地址：<http://localhost:5177/>

## 建议怎么点

1. **初始化演示仓库**（离线即可）：会写入 `locales/*.json`，并切到 `draft` 分支。
2. 在文案表里改译文 → **保存文案到工作区** → **Commit**。
3. 点某条历史 → 只读预览；再点 **回滚写入工作区**（对应 CMS「回滚到草稿」）。
4. 建一个分支改文案，再 **Merge** 回 `draft` / `main`。
5. 用 tag 模拟锁定版本。
6. 打开顶部 **可行性**，看 CMS 能力与 Git 语义的对照。

Clone 远程仓库需要 CORS 代理（默认 `https://cors.isomorphic-git.org`）。私有库和 Push 需要 Token。仓库数据在浏览器 IndexedDB，刷新仍在。

## 结论摘要

浏览器 Git **能**做文件级读写、提交、分支、合并、对比、回滚。  
它 **不适合**单独当 i18n CMS 主库：权限、检索、不进版本的主数据、锁定/跳号删除都不是 Git 语义。更稳的做法是 CMS 继续用数据库，Git 只做发布面。
