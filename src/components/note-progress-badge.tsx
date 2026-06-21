"use client";

import { useProgress } from "@/components/progress-provider";

export function NoteProgressBadge({ slug }: { slug: string }) {
  const { isCompleted, loading } = useProgress();
  if (loading) return null;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCompleted(slug) ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      {isCompleted(slug) ? "已学" : "未学"}
    </span>
  );
}
