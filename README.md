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

## 学习记录数据库

学习记录使用 Postgres 保存。部署到 Vercel 后，在项目的环境变量里添加：

```text
DATABASE_URL=你的 Postgres 连接字符串
```

没有配置数据库时，网站仍可阅读内容，但“标记已学”和已学统计不会保存。

记录表会在第一次访问 `/api/progress` 时自动创建：

```sql
create table if not exists learning_records (
  learner_id text not null,
  note_slug text not null,
  completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (learner_id, note_slug)
);
```

## 验证

```bash
npm run lint
npm run build
```
