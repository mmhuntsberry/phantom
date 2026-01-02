"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "./button/button";
import styles from "./ReaderSessionTracker.module.css";

type ReaderSessionTrackerProps = {
  token: string;
};

const HEARTBEAT_MS = 60000;

export default function ReaderSessionTracker({ token }: ReaderSessionTrackerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const storageKey = useMemo(() => `reader-session-${token}`, [token]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let currentId = window.localStorage.getItem(storageKey);
    if (!currentId) {
      currentId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      window.localStorage.setItem(storageKey, currentId);
    }
    setSessionId(currentId);

    fetch("/api/reader/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sessionId: currentId, action: "start" }),
    }).catch(() => null);
    fetch("/api/reader/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: currentId,
        eventName: "page_view",
        meta: { page: "reader" },
      }),
    }).catch(() => null);

    const interval = window.setInterval(() => {
      fetch("/api/reader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, sessionId: currentId, action: "heartbeat" }),
      }).catch(() => null);
    }, HEARTBEAT_MS);

    return () => window.clearInterval(interval);
  }, [storageKey, token]);

  async function markComplete() {
    if (!sessionId) return;
    setStatus("");
    try {
      const res = await fetch("/api/reader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          sessionId,
          action: "complete",
          completionMethod: "end_reached",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Thanks for reading. You're marked complete.");
      } else {
        setStatus(data.error || "Could not mark complete.");
      }
    } catch (error) {
      setStatus("Could not mark complete.");
    }
  }

  return (
    <div className={styles.container}>
      <Button type="button" onClick={markComplete} disabled={!sessionId}>
        Finish reading
      </Button>
      {status && (
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
