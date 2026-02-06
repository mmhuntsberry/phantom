"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./button/button";
import styles from "./ReaderSessionTracker.module.css";

type ReaderSessionTrackerProps = {
  sessionId: string;
  token?: string;
};

const HEARTBEAT_MS = 60000;

export default function ReaderSessionTracker({
  sessionId,
  token,
}: ReaderSessionTrackerProps) {
  const [status, setStatus] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      id: string;
      left: string;
      delay: string;
      duration: string;
      rotation: string;
      size: string;
      color: string;
    }>
  >([]);
  const router = useRouter();

  const confettiColors = useMemo(
    () => ["#f97316", "#f59e0b", "#fbbf24", "#10b981", "#0ea5e9"],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.body.style.overflow = showSuccess ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSuccess]);

  useEffect(() => {
    if (!showSuccess) return;
    const timeout = window.setTimeout(() => {
      setConfettiPieces([]);
    }, 2800);
    return () => window.clearTimeout(timeout);
  }, [showSuccess]);

  function launchConfetti() {
    const pieces = Array.from({ length: 28 }, (_, index) => {
      const left = `${Math.random() * 100}%`;
      const delay = `${Math.random() * 0.4}s`;
      const duration = `${1.8 + Math.random() * 1.2}s`;
      const rotation = `${Math.random() * 360}deg`;
      const size = `${8 + Math.random() * 6}px`;
      const color = confettiColors[index % confettiColors.length];
      return {
        id: `${Date.now()}-${index}`,
        left,
        delay,
        duration,
        rotation,
        size,
        color,
      };
    });
    setConfettiPieces(pieces);
  }

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
        setStatus("");
        setShowSuccess(true);
        launchConfetti();
      } else {
        setStatus(data.error || "Could not mark complete.");
      }
    } catch (error) {
      setStatus("Could not mark complete.");
    }
  }

  return (
    <div className={styles.container}>
      <Button
        type="button"
        onClick={markComplete}
        disabled={!sessionId}
        className={styles.primaryButton}
      >
        Finish reading
      </Button>
      {status && (
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>
      )}

      {showSuccess && (
        <div className={styles.successOverlay} role="dialog" aria-modal="true">
          {confettiPieces.length > 0 && (
            <div className={styles.confetti} aria-hidden="true">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className={styles.confettiPiece}
                  style={{
                    left: piece.left,
                    animationDelay: piece.delay,
                    animationDuration: piece.duration,
                    width: piece.size,
                    height: piece.size,
                    backgroundColor: piece.color,
                    ["--confetti-rotate" as string]: piece.rotation,
                  }}
                />
              ))}
            </div>
          )}
          <div className={styles.modal}>
            <p className={styles.modalKicker}>Thanks for reading</p>
            <h3 className={styles.modalTitle}>You’re marked complete.</h3>
            <p className={styles.modalBody}>
              Want to help shape the book? The 2-minute survey makes a big
              difference.
            </p>
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => {
                  if (token) {
                    router.push(`/r/${token}/survey`);
                  } else {
                    router.push("/");
                  }
                }}
                className={styles.modalButton}
              >
                Take the 2-minute survey
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
