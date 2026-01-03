"use client";

import { useEffect, useState } from "react";
import Button from "./button/button";
import styles from "./ReaderSessionTracker.module.css";

type ReaderSessionTrackerProps = {
  sessionId: string;
};

const HEARTBEAT_MS = 60000;

export default function ReaderSessionTracker({
  sessionId,
}: ReaderSessionTrackerProps) {
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    fetch("/api/reader/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        eventName: "page_view",
        meta: { page: "reader" },
      }),
    }).catch(() => null);

    const interval = window.setInterval(() => {
      fetch("/api/reader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: "heartbeat" }),
      }).catch(() => null);
    }, HEARTBEAT_MS);

    return () => window.clearInterval(interval);
  }, [sessionId]);

  async function markComplete() {
    setStatus("");
    try {
      const res = await fetch("/api/reader/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
