"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ReaderTokenGate.module.css";

type ReaderTokenGateProps = {
  token: string;
  program: string;
  readingMode: "partial" | "full";
};

export default function ReaderTokenGate({
  token,
  program,
  readingMode,
}: ReaderTokenGateProps) {
  const router = useRouter();
  const [status, setStatus] = useState("Preparing your reading session...");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sessionKey = `reader-session-${token}`;
    let sessionId = window.localStorage.getItem(sessionKey);
    if (!sessionId) {
      sessionId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      window.localStorage.setItem(sessionKey, sessionId);
    }

    document.cookie = `reader_session=${sessionId}; path=/; SameSite=Lax`;
    document.cookie = `reader_token=${token}; path=/; SameSite=Lax`;

    fetch("/api/reader/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sessionId, action: "start" }),
    })
      .then(() => {
        const target =
          readingMode === "full"
            ? `/read/full/${program}`
            : `/read/partial/${program}`;
        router.replace(target);
      })
      .catch(() => {
        setStatus("Could not start the session. Please try again.");
      });
  }, [program, readingMode, router, token]);

  return <p className={styles.status}>{status}</p>;
}
