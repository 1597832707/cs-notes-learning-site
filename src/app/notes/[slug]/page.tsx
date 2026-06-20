import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllNotes, getNoteBySlug, headingId, type NoteHeading } from "@/lib/notes";

type NotePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode };
    return textFromNode(props.children);
  }
  return "";
}

function createHeadingIdResolver(headings: NoteHeading[]) {
  const idsByBase = new Map<string, string[]>();

  for (const heading of headings) {
    const base = headingId(heading.text);
    idsByBase.set(base, [...(idsByBase.get(base) ?? []), heading.id]);
  }

  return (text: string) => {
    const base = headingId(text);
    const ids = idsByBase.get(base);
    return ids?.shift() ?? base;
  };
}

function extractHeadingsFromContent(content: string): NoteHeading[] {
  const seen = new Map<string, number>();

  return Array.from(content.matchAll(/^(#{2,4})[ \t]+(.+)$/gm)).map((match) => {
    const text = match[2]
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, "")
      .replace(/[*_~]/g, "")
      .trim();
    const base = headingId(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);

    return {
      id: count === 0 ? base : `${base}-${count + 1}`,
      level: match[1].length,
      text,
    };
  });
}

function createHeadingRenderer(level: 2 | 3 | 4, resolveId: (text: string) => string) {
  const Tag = `h${level}` as const;

  return function Heading({ children, ...props }: ComponentProps<typeof Tag>) {
    const text = textFromNode(children);
    const id = resolveId(text);

    return (
      <Tag id={id} {...props}>
        <a className="heading-anchor" href={`#${id}`} aria-label={`跳转到 ${text}`}>
          #
        </a>
        {children}
      </Tag>
    );
  };
}

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
  const headings = note.headings.length > 0 ? note.headings : extractHeadingsFromContent(note.content);
  const resolveHeadingId = createHeadingIdResolver(headings);
  const Heading2 = createHeadingRenderer(2, resolveHeadingId);
  const Heading3 = createHeadingRenderer(3, resolveHeadingId);
  const Heading4 = createHeadingRenderer(4, resolveHeadingId);

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:grid-cols-[minmax(0,1fr)_260px] md:grid-cols-[minmax(0,1fr)_280px] lg:gap-8 lg:px-6 lg:py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <Link className="text-sm font-medium text-cyan-700 hover:text-cyan-900" href="/notes">
          返回目录
        </Link>

        <div className="mt-6 border-b border-slate-200 pb-6">
          <p className="text-sm font-medium text-cyan-700">{note.category}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">{note.title}</h1>
          <p className="mt-3 text-sm text-slate-500">预计阅读 {note.estimatedMinutes} 分钟</p>
        </div>

        <div className="prose prose-slate mt-8 max-w-none">
          <ReactMarkdown
            components={{
              h2: Heading2,
              h3: Heading3,
              h4: Heading4,
            }}
            remarkPlugins={[remarkGfm]}
          >
            {note.content}
          </ReactMarkdown>
        </div>
      </article>

      <aside className="flex h-fit flex-col gap-6 sm:sticky sm:top-6">
        <section className="rounded-3xl border border-cyan-200 bg-white p-5 shadow-sm lg:p-6">
          <p className="text-sm font-semibold text-cyan-800">本文目录</p>
          {headings.length > 0 ? (
            <nav className="mt-4 max-h-[65vh] space-y-1 overflow-auto pr-2 text-sm">
              {headings.map((heading) => (
                <a
                  className="block rounded-xl px-3 py-2 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-800"
                  href={`#${heading.id}`}
                  key={heading.id}
                  style={{ paddingLeft: `${(heading.level - 2) * 14 + 12}px` }}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          ) : (
            <p className="mt-4 text-sm text-slate-500">这篇文章没有可生成目录的二级标题。</p>
          )}
        </section>

        <section className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6 shadow-sm">
          <p className="text-sm font-semibold text-cyan-900">AI 答疑占位</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">围绕当前文章提问</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            下一步可以在这里接入大模型：把当前 Markdown 内容作为上下文，回答你的疑问，并给出学习建议和小测题。
          </p>
          <div className="mt-5 rounded-2xl border border-cyan-200 bg-white p-4 text-sm text-slate-500">
            例：这篇文章的核心概念是什么？有哪些容易混淆的点？
          </div>
        </section>
      </aside>
    </main>
  );
}
