"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./ReaderProgressIndicator.module.css";

type ReaderProgressIndicatorProps = {
  sessionId: string;
  totalChapters: number;
};

export default function ReaderProgressIndicator({
  sessionId,
  totalChapters,
}: ReaderProgressIndicatorProps) {
  const [viewedChapters, setViewedChapters] = useState<number[]>([]);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure header height and update sticky position
  useEffect(() => {
    if (typeof window === "undefined") return;

    function updateHeaderHeight() {
      const header = document.querySelector("header");
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
      }
    }

    // Initial measurement
    updateHeaderHeight();

    // Update on resize
    window.addEventListener("resize", updateHeaderHeight);
    
    // Use ResizeObserver to watch for header size changes
    const header = document.querySelector("header");
    if (header) {
      const resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      resizeObserver.observe(header);

      return () => {
        window.removeEventListener("resize", updateHeaderHeight);
        resizeObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

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
        // Silently fail - progress is not critical
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();

    // Refresh progress periodically
    const interval = setInterval(fetchProgress, 5000); // Every 5 seconds

    // Also refresh when window gains focus (user might have scrolled)
    const handleFocus = () => fetchProgress();
    window.addEventListener("focus", handleFocus);

    // Listen for custom events from ReaderChapterTracker
    const handleChapterEvent = () => {
      // Small delay to allow the event to be saved to the database
      setTimeout(fetchProgress, 1000);
    };
    window.addEventListener("chapter-viewed", handleChapterEvent);
    window.addEventListener("chapter-ended", handleChapterEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("chapter-viewed", handleChapterEvent);
      window.removeEventListener("chapter-ended", handleChapterEvent);
    };
  }, [sessionId]);

  if (loading) return null;

  // Only show progress bar once user has started reading (viewed at least one chapter)
  if (viewedChapters.length === 0) return null;

  const progress = totalChapters > 0 ? (viewedChapters.length / totalChapters) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ top: headerHeight > 0 ? `${headerHeight}px` : undefined }}
    >
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={viewedChapters.length}
          aria-valuemin={0}
          aria-valuemax={totalChapters}
        />
      </div>
    </div>
  );
}
