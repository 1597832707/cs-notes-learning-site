"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CompletedRecord = {
  completedAt: string;
  noteSlug: string;
};

type ProgressContextValue = {
  completedCount: number;
  databaseConfigured: boolean;
  isCompleted: (slug: string) => boolean;
  loading: boolean;
  toggleCompleted: (slug: string) => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<CompletedRecord[]>([]);
  const [databaseConfigured, setDatabaseConfigured] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/progress")
      .then((response) => response.json())
      .then((data: { completed?: CompletedRecord[]; databaseConfigured?: boolean }) => {
        if (cancelled) return;
        setCompleted(data.completed ?? []);
        setDatabaseConfigured(data.databaseConfigured ?? true);
      })
      .catch(() => {
        if (!cancelled) setDatabaseConfigured(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const completedSlugs = useMemo(() => new Set(completed.map((record) => record.noteSlug)), [completed]);

  const toggleCompleted = useCallback(
    async (slug: string) => {
      const nextCompleted = !completedSlugs.has(slug);
      const response = await fetch("/api/progress", {
        body: JSON.stringify({ completed: nextCompleted, slug }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { completed?: CompletedRecord[]; databaseConfigured?: boolean };

      setCompleted(data.completed ?? []);
      setDatabaseConfigured(data.databaseConfigured ?? response.ok);
    },
    [completedSlugs],
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      completedCount: completed.length,
      databaseConfigured,
      isCompleted: (slug: string) => completedSlugs.has(slug),
      loading,
      toggleCompleted,
    }),
    [completed.length, completedSlugs, databaseConfigured, loading, toggleCompleted],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used within ProgressProvider.");
  return context;
}
