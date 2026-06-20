import Link from "next/link";
import { getNotesByCategory, noteHref } from "@/lib/notes";

export default function NotesPage() {
  const groups = getNotesByCategory();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <section className="rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-sm">
        <p className="text-sm font-medium text-cyan-200">课程目录</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">CS-Notes 学习内容</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          已从本地 CS-Notes 的 notes 目录读取 Markdown 笔记，并按主题自动分组。先从每日学习开始，或者直接挑一个专题进入。
        </p>
      </section>

      <div className="grid gap-6">
        {Object.entries(groups).map(([category, notes]) => (
          <section key={category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">{category}</h2>
                <p className="mt-1 text-sm text-slate-500">{notes.length} 篇内容</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {notes.map((note) => (
                <Link
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50"
                  href={noteHref(note.slug)}
                  key={note.slug}
                >
                  <h3 className="font-medium text-slate-900">{note.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">预计 {note.estimatedMinutes} 分钟</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
