"use client";

import React, { useEffect, useMemo, useState, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "./button/button";
import Input from "./input/input";
import Label from "./label/label";
import styles from "./ReaderApplyForm.module.css";

type ReaderApplyFormProps = {
  cohortType: "beta" | "arc";
  program: string;
  bookId?: string; // Sanity book _id
};

const formatOptions = [
  { value: "", label: "Select a format (optional)" },
  { value: "web", label: "Web / browser" },
  { value: "epub", label: "EPUB" },
  { value: "pdf", label: "PDF" },
];

export default function ReaderApplyForm({
  cohortType,
  program,
  bookId,
}: ReaderApplyFormProps) {
  const emailId = useId();
  const formatId = useId();
  const notesId = useId();
  const tasteId = useId();
  const sourceId = useId();
  const honeypotId = useId();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [formatPref, setFormatPref] = useState("");
  const [contentNotesAck, setContentNotesAck] = useState(false);
  const [tasteProfile, setTasteProfile] = useState("");
  const [source, setSource] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
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

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!email.trim() || !email.includes("@")) {
      nextErrors.email = "Enter a valid email.";
    }
    if (!contentNotesAck) {
      nextErrors.contentNotesAck = "Please confirm you read the content notes.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!validate()) return;

    const querySource =
      searchParams.get("utm_source") || searchParams.get("src") || "";

    setLoading(true);
    try {
      const res = await fetch("/api/reader/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cohortType,
          program,
          email: email.trim(),
          formatPref: formatPref || null,
          contentNotesAck,
          tasteProfile: tasteProfile.trim() || null,
          source: source.trim() || querySource || null,
          bookId: bookId || null,
          honeypot,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("");
        setShowSuccess(true);
        launchConfetti();
        setEmail("");
        setFormatPref("");
        setContentNotesAck(false);
        setTasteProfile("");
        setSource("");
        setHoneypot("");
      } else {
        // Show detailed error for debugging
        const errorMsg = data.error || "Something went wrong. Try again.";
        const details = data.details ? ` (${data.details})` : "";
        const code = data.code ? ` [Code: ${data.code}]` : "";
        setMessage(`${errorMsg}${details}${code}`);
        // Also log to console for debugging
        console.error("Submission error:", data);
      }
    } catch (error) {
      setMessage("Could not submit right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.field}>
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          required
        />
        {errors.email && (
          <p className={styles.error} id={`${emailId}-error`}>
            {errors.email}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor={formatId}>How do you usually read?</Label>
        <select
          id={formatId}
          className={styles.select}
          value={formatPref}
          onChange={(event) => setFormatPref(event.target.value)}
        >
          {formatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <div className={styles.checkboxRow}>
          <input
            id={notesId}
            type="checkbox"
            checked={contentNotesAck}
            onChange={(event) => setContentNotesAck(event.target.checked)}
            aria-describedby={
              errors.contentNotesAck ? `${notesId}-error` : undefined
            }
            required
          />
          <Label htmlFor={notesId}>I have read the content notes.</Label>
        </div>
        {errors.contentNotesAck && (
          <p className={styles.error} id={`${notesId}-error`}>
            {errors.contentNotesAck}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor={tasteId}>Preferred genres (optional)</Label>
        <textarea
          id={tasteId}
          className={styles.textarea}
          value={tasteProfile}
          onChange={(event) => setTasteProfile(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor={sourceId}>Where did you find this? (Optional)</Label>
        <Input
          id={sourceId}
          type="text"
          value={source}
          onChange={(event) => setSource(event.target.value)}
        />
      </div>

      <div className={styles.hiddenField} aria-hidden="true">
        <label htmlFor={honeypotId}>Company</label>
        <input
          id={honeypotId}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting" : "Apply"}
        </Button>
        {message && (
          <p className={styles.helper} role="status" aria-live="polite">
            {message}
          </p>
        )}
      </div>

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
            <p className={styles.modalKicker}>Application received</p>
            <h3 className={styles.modalTitle}>Thanks for applying.</h3>
            <p className={styles.modalBody}>
              If you’re selected, you’ll get a private access link by email.
            </p>
            <div className={styles.modalActions}>
              <Button
                type="button"
                onClick={() => router.push("/")}
                className={styles.modalButton}
              >
                Back to Start Here
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
