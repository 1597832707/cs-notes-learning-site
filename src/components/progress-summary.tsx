"use client";

import { useProgress } from "@/components/progress-provider";

export function ProgressSummary() {
  const { completedCount, databaseConfigured, loading } = useProgress();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
      <p className="text-3xl font-bold">{loading ? "-" : completedCount}</p>
      <p className="mt-1 text-sm text-slate-300">已学篇数</p>
      {!databaseConfigured ? <p className="mt-2 text-xs text-amber-100">待配置数据库</p> : null}
    </div>
  );
}
