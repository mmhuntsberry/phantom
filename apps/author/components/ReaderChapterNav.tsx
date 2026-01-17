"use client";

import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react/dist/ssr";
import styles from "./ReaderChapterNav.module.css";

type Chapter = {
  order: number;
  chapterLabel: string;
  title?: string;
};

type ReaderChapterNavProps = {
  chapters: Chapter[];
  viewedChapters?: number[];
  completedChapters?: number[];
};

export default function ReaderChapterNav({
  chapters,
  viewedChapters = [],
  completedChapters = [],
}: ReaderChapterNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function scrollToChapter(order: number) {
    const element = document.querySelector(`[data-chapter-order="${order}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.toggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Chapter navigation"
      >
        <span className={styles.toggleText}>Jump to chapter</span>
        <span className={styles.toggleIcon}>{isOpen ? "−" : "+"}</span>
      </button>

      {isOpen && (
        <nav className={styles.nav} aria-label="Chapter navigation">
          <ul className={styles.list}>
            {chapters.map((chapter) => {
              const isViewed = viewedChapters.includes(chapter.order);
              const isCompleted = completedChapters.includes(chapter.order);
              
              return (
                <li key={chapter.order} className={styles.item}>
                  <button
                    className={`${styles.link} ${
                      isCompleted ? styles.completed : ""
                    } ${isViewed ? styles.viewed : ""}`}
                    onClick={() => scrollToChapter(chapter.order)}
                  >
                    <span className={styles.chapterNumber}>
                      {chapter.chapterLabel}
                    </span>
                    {chapter.title && (
                      <span className={styles.chapterTitle}>
                        {chapter.title}
                      </span>
                    )}
                    {isCompleted && (
                      <span className={styles.status} aria-label="Completed">
                        <Check size={20} weight="bold" />
                      </span>
                    )}
                    {isViewed && !isCompleted && (
                      <span className={styles.status} aria-label="In progress">
                        ○
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
