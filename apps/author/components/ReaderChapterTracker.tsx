"use client";

import { useEffect } from "react";

const VIEW_THRESHOLD = 0.55;
const END_THRESHOLD = 0.8;

export default function ReaderChapterTracker({
  sessionId,
}: {
  sessionId: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const chapters = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter-order]")
    );
    const chapterEnds = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter-end-order]")
    );

    const seenView = new Set<string>();
    const seenEnd = new Set<string>();

    const viewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const order = entry.target.getAttribute("data-chapter-order");
          if (!order || seenView.has(order)) return;
          seenView.add(order);
          fetch("/api/reader/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              eventName: "chapter_view",
              meta: { chapterOrder: Number(order) },
            }),
          }).catch(() => null);
          
          // Dispatch custom event for progress indicator
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("chapter-viewed"));
          }
        });
      },
      { threshold: VIEW_THRESHOLD }
    );

    const endObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const order = entry.target.getAttribute("data-chapter-end-order");
          if (!order || seenEnd.has(order)) return;
          seenEnd.add(order);
          fetch("/api/reader/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              eventName: "chapter_end",
              meta: { chapterOrder: Number(order) },
            }),
          }).catch(() => null);
          
          // Dispatch custom event for progress indicator
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("chapter-ended"));
          }
        });
      },
      { threshold: END_THRESHOLD }
    );

    chapters.forEach((node) => viewObserver.observe(node));
    chapterEnds.forEach((node) => endObserver.observe(node));

    return () => {
      viewObserver.disconnect();
      endObserver.disconnect();
    };
  }, [sessionId]);

  return null;
}
