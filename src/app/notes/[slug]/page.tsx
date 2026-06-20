import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";

type NotePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: NotePageProps) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  return {
    title: `${note.title} | CS-Notes Learning`,
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <Link className="text-sm font-medium text-cyan-700 hover:text-cyan-900" href="/notes">
          ← 返回目录
        </Link>

        <div className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-sm font-medium text-cyan-700">{note.category}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{note.title}</h1>
          <p className="mt-3 text-sm text-slate-500">预计阅读 {note.estimatedMinutes} 分钟</p>
        </div>

        <div className="prose prose-slate mt-8 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
        </div>
      </article>

      <aside className="h-fit rounded-3xl border border-cyan-100 bg-cyan-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-cyan-900">AI 答疑占位</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">围绕当前文章提问</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          下一步可以在这里接入大模型：把当前 Markdown 内容作为上下文，回答你的疑问，并给出学习建议和小测题。
        </p>
        <div className="mt-5 rounded-2xl border border-cyan-200 bg-white p-4 text-sm text-slate-500">
          例：这篇文章的核心概念是什么？有哪些容易混淆的点？
        </div>
      </aside>
    </main>
  );
}
