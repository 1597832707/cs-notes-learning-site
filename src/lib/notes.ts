import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const notesRoot = process.env.CS_NOTES_PATH ?? path.join(process.cwd(), "content", "notes");

export type NoteSummary = {
  slug: string;
  title: string;
  category: string;
  estimatedMinutes: number;
};

export type Note = NoteSummary & {
  content: string;
  headings: NoteHeading[];
  sourcePath: string;
};

export type NoteHeading = {
  id: string;
  level: number;
  text: string;
};

function titleFromFile(fileName: string) {
  return fileName.replace(/\.md$/i, "").replace(/^\d+(\.\d+)?\s*/, "");
}

export function noteHref(slug: string) {
  return `/notes/${encodeURIComponent(slug)}`;
}

function categoryForTitle(title: string) {
  if (title.includes("Leetcode")) return "LeetCode";
  if (title.includes("剑指") || /^\d/.test(title)) return "剑指 Offer";
  if (title.includes("Java")) return "Java";
  if (title.includes("计算机操作系统")) return "操作系统";
  if (title.includes("计算机网络") || ["HTTP", "Socket"].includes(title)) return "计算机网络";
  if (["MySQL", "Redis", "SQL"].some((keyword) => title.includes(keyword))) return "数据库";
  if (title.includes("设计模式") || title.includes("面向对象")) return "面向对象";
  if (["系统设计", "分布式", "集群", "缓存", "消息队列"].some((keyword) => title.includes(keyword))) {
    return "系统设计";
  }
  if (["Git", "Docker", "Linux", "构建工具", "正则表达式"].some((keyword) => title.includes(keyword))) {
    return "工具";
  }
  if (title.includes("算法")) return "算法";
  return "基础知识";
}

function estimateMinutes(content: string) {
  const chineseChars = content.match(/[\u4e00-\u9fa5]/g)?.length ?? 0;
  const englishWords = content.match(/[A-Za-z0-9_]+/g)?.length ?? 0;
  return Math.max(8, Math.ceil((chineseChars + englishWords) / 420));
}

function stripGeneratedToc(content: string) {
  return content.replace(/<!--\s*GFM-TOC\s*-->[\s\S]*?<!--\s*GFM-TOC\s*-->/g, "").trim();
}

function stripMarkdown(text: string) {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_~]/g, "")
    .trim();
}

export function headingId(text: string) {
  const base = stripMarkdown(text)
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return base || "section";
}

function uniqueHeadingId(text: string, seen: Map<string, number>) {
  const base = headingId(text);
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function extractHeadings(content: string) {
  const seen = new Map<string, number>();

  return content
    .split("\n")
    .map((line) => line.match(/^(#{2,4})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => {
      const text = stripMarkdown(match[2]);

      return {
        id: uniqueHeadingId(text, seen),
        level: match[1].length,
        text,
      };
    });
}

export function getAllNotes(): NoteSummary[] {
  const files = fs
    .readdirSync(notesRoot)
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN", { numeric: true }));

  return files.map((file) => {
    const sourcePath = path.join(notesRoot, file);
    const raw = fs.readFileSync(sourcePath, "utf8");
    const parsed = matter(raw);
    const title = parsed.data.title ?? titleFromFile(file);

    return {
      slug: file.replace(/\.md$/i, ""),
      title,
      category: categoryForTitle(title),
      estimatedMinutes: estimateMinutes(parsed.content),
    };
  });
}

export function getNoteBySlug(slug: string): Note {
  const decodedSlug = decodeURIComponent(slug);
  const fileName = `${decodedSlug}.md`;
  const sourcePath = path.join(notesRoot, fileName);
  const raw = fs.readFileSync(sourcePath, "utf8");
  const parsed = matter(raw);
  const title = parsed.data.title ?? titleFromFile(fileName);
  const content = stripGeneratedToc(parsed.content);

  return {
    slug,
    title,
    category: categoryForTitle(title),
    estimatedMinutes: estimateMinutes(parsed.content),
    content,
    headings: extractHeadings(content),
    sourcePath,
  };
}

export function getDailyNotes(date = new Date(), count = 3) {
  const notes = getAllNotes();
  const daySeed = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const algorithmNotes = notes.filter(isAlgorithmPractice);
  const foundationNotes = notes.filter((note) => !isAlgorithmPractice(note));
  const plan = count <= 1 ? ["foundation"] : count === 2 ? ["foundation", "algorithm"] : ["foundation", "algorithm", "foundation"];
  const selected: NoteSummary[] = [];

  for (let index = 0; index < count; index += 1) {
    const kind = plan[index % plan.length];
    const primaryPool = kind === "algorithm" ? algorithmNotes : foundationNotes;
    const fallbackPool = kind === "algorithm" ? foundationNotes : algorithmNotes;
    const picked = pickDailyNote(primaryPool, daySeed, index, selected) ?? pickDailyNote(fallbackPool, daySeed, index, selected);

    if (picked) selected.push(picked);
  }

  while (selected.length < count) {
    const picked = pickDailyNote(notes, daySeed, selected.length, selected);
    if (!picked) break;
    selected.push(picked);
  }

  return selected;
}

function isAlgorithmPractice(note: NoteSummary) {
  return (
    note.category === "LeetCode" ||
    note.category.includes("Offer") ||
    note.category.includes("算法") ||
    note.title.includes("Leetcode") ||
    note.title.includes("LeetCode") ||
    note.title.includes("剑指") ||
    note.title.includes("算法") ||
    /^\d+(\.\d+)?\s/.test(note.slug)
  );
}

function pickDailyNote(pool: NoteSummary[], daySeed: number, slot: number, selected: NoteSummary[]) {
  if (pool.length === 0) return undefined;
  const start = (daySeed * 7 + slot * 13) % pool.length;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const note = pool[(start + offset) % pool.length];
    if (!selected.some((item) => item.slug === note.slug)) return note;
  }

  return undefined;
}

export function getNotesByCategory() {
  return getAllNotes().reduce<Record<string, NoteSummary[]>>((groups, note) => {
    groups[note.category] ??= [];
    groups[note.category].push(note);
    return groups;
  }, {});
}
