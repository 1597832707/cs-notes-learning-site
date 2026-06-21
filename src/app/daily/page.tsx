import Link from "next/link";
import { NoteProgressBadge } from "@/components/note-progress-badge";
import { getDailyNotes, noteHref } from "@/lib/notes";

export default function DailyPage() {
  const today = new Date();
  const notes = getDailyNotes(today, 3);
  const totalMinutes = notes.reduce((sum, note) => sum + note.estimatedMinutes, 0);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <section className="rounded-3xl bg-gradient-to-br from-cyan-600 to-slate-950 px-8 py-10 text-white shadow-sm">
        <p className="text-sm font-medium text-cyan-100">每日学习</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">今天先学这 3 篇</h1>
        <p className="mt-4 max-w-2xl text-cyan-50">
          系统会按日期从 CS-Notes 中稳定挑选内容，适合每天推进一点。今天预计 {totalMinutes} 分钟。
        </p>
      </section>

      <div className="grid gap-4">
        {notes.map((note, index) => (
          <Link
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50"
            href={noteHref(note.slug)}
            key={note.slug}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-cyan-700">第 {index + 1} 项 · {note.category}</p>
                <div className="mt-2 flex items-start gap-3">
                  <h2 className="text-2xl font-semibold text-slate-950 group-hover:text-cyan-950">{note.title}</h2>
                  <NoteProgressBadge slug={note.slug} />
                </div>
              </div>
              <p className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 group-hover:bg-white">
                {note.estimatedMinutes} 分钟
              </p>
            </div>
          </Link>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-semibold text-slate-950">建议学习节奏</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
          <li className="rounded-2xl bg-white p-4">1. 先通读文章，标记不懂的概念。</li>
          <li className="rounded-2xl bg-white p-4">2. 用自己的话写 3 句总结。</li>
          <li className="rounded-2xl bg-white p-4">3. 把疑问交给 AI 答疑模块追问。</li>
        </ol>
      </section>
    </main>
  );
}
