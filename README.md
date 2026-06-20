# CS-Notes Learning Site

基于本地 `CS-Notes/notes` Markdown 内容搭建的 Next.js 学习网站初版。

## 功能

- 首页：展示内容库概览和今日任务入口
- 课程目录：自动扫描并按主题分组展示 `notes/*.md`
- 笔记阅读页：渲染 Markdown、表格、代码块和图片
- 每日学习：按日期稳定推荐 3 篇内容
- AI 答疑区域：已预留文章侧边栏入口，后续可接入大模型/RAG

## 启动

```bash
npm run dev
```

然后打开：

```text
http://localhost:3000
```

## 内容路径

默认读取项目内置内容：

```text
content\notes
```

如果以后想改成读取别的 notes 目录，可以复制 `.env.local.example` 为 `.env.local`，然后修改：

```text
CS_NOTES_PATH=新的 notes 目录路径
```

## 验证

```bash
npm run lint
npm run build
```
