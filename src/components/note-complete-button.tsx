"use client";

import { useTransition } from "react";
import { useProgress } from "@/components/progress-provider";

export function NoteCompleteButton({ slug }: { slug: string }) {
  const { databaseConfigured, isCompleted, loading, toggleCompleted } = useProgress();
  const [pending, startTransition] = useTransition();
  const completed = isCompleted(slug);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">学习记录</p>
      <button
        className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={loading || pending || !databaseConfigured}
        onClick={() => startTransition(() => void toggleCompleted(slug))}
        type="button"
      >
        {completed ? "已学完，点击取消" : "标记为已学完"}
      </button>
      {!databaseConfigured ? (
        <p className="mt-3 text-xs leading-5 text-amber-700">数据库还没配置。部署后在 Vercel 添加 DATABASE_URL 即可保存记录。</p>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-500">{completed ? "这篇文章已经记录到数据库。" : "完成阅读后点击按钮保存进度。"}</p>
      )}
    </div>
  );
}
