"use client";

import { useEffect, useState } from "react";
import ReaderChapterNav from "./ReaderChapterNav";

type Chapter = {
  order: number;
  chapterLabel: string;
  title?: string;
};

type ReaderChapterNavWithProgressProps = {
  sessionId: string;
  chapters: Chapter[];
};

export default function ReaderChapterNavWithProgress({
  sessionId,
  chapters,
}: ReaderChapterNavWithProgressProps) {
  const [viewedChapters, setViewedChapters] = useState<number[]>([]);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function fetchProgress() {
      try {
        const res = await fetch(`/api/reader/progress?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.success) {
          setViewedChapters(data.viewedChapters || []);
          setCompletedChapters(data.completedChapters || []);
        }
      } catch (error) {
        // Silently fail
      }
    }

    fetchProgress();

    // Refresh progress periodically and when window gains focus
    const interval = setInterval(fetchProgress, 5000);
    const handleFocus = () => fetchProgress();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [sessionId]);

  return (
    <ReaderChapterNav
      chapters={chapters}
      viewedChapters={viewedChapters}
      completedChapters={completedChapters}
    />
  );
}
