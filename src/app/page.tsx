import Link from "next/link";
import { getAllNotes, getDailyNotes, noteHref } from "@/lib/notes";

export default function Home() {
  const notes = getAllNotes();
  const dailyNotes = getDailyNotes(new Date(), 3);
  const categories = new Set(notes.map((note) => note.category));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <section className="grid gap-8 rounded-[2rem] bg-slate-950 p-8 text-white shadow-sm md:grid-cols-[1.25fr_0.75fr] md:p-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">CS-Notes Learning</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-tight md:text-6xl">
            每天学一点计算机基础
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            基于本地 CS-Notes 笔记搭建的学习网站。先完成每日学习，再进入专题目录查漏补缺，后续可以接入大模型做上下文答疑。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200" href="/daily">
              开始今日学习
            </Link>
            <Link className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10" href="/notes">
              查看课程目录
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
          <p className="text-sm text-cyan-100">当前内容库</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-bold">{notes.length}</p>
              <p className="mt-1 text-sm text-slate-300">篇笔记</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-3xl font-bold">{categories.size}</p>
              <p className="mt-1 text-sm text-slate-300">个主题</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {dailyNotes.map((note, index) => (
          <Link className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50" href={noteHref(note.slug)} key={note.slug}>
            <p className="text-sm font-semibold text-cyan-700">今日任务 {index + 1}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">{note.title}</h2>
            <p className="mt-3 text-sm text-slate-500">{note.category} · 预计 {note.estimatedMinutes} 分钟</p>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">下一阶段：大模型答疑</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          初版先把学习内容跑通。后续可以把 Markdown 切片、向量化，然后在每篇文章旁边提供 AI 问答，让回答优先引用 CS-Notes 原文。
        </p>
      </section>
    </main>
  );
}
