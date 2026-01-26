"use client";

import { useState } from "react";
import Button from "./button/button";
import styles from "./ResetProgressButton.module.css";

type ResetProgressButtonProps = {
  sessionId: string;
};

export default function ResetProgressButton({
  sessionId,
}: ResetProgressButtonProps) {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!confirm("Are you sure you want to reset your reading progress? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/admin/reader/reset-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Progress reset successfully. Refreshing...");
        // Reload the page to reflect the reset
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setStatus(data.error || "Failed to reset progress.");
      }
    } catch (error) {
      setStatus("Failed to reset progress.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <Button
        type="button"
        onClick={handleReset}
        disabled={loading || !sessionId}
      >
        {loading ? "Resetting..." : "Reset Progress"}
      </Button>
      {status && (
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>
      )}
    </div>
  );
}
