"use client";

import React, { useId, useState, useMemo, useEffect } from "react";
import { PaperPlaneTilt, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import Button from "./button/button";
import Input from "./input/input";
import Label from "./label/label";
import styles from "./SubscribeForm.module.css";

type SubscribeFormProps = {
  label?: string;
  placeholder?: string;
  buttonLabel?: string;
  successMessage?: string;
};

export default function SubscribeForm({
  label = "Enter Email",
  placeholder = "Early chapters. Clear updates. No noise.",
  buttonLabel = "Subscribe",
  successMessage = "You're in. New work and updates are on the way.",
}: SubscribeFormProps) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setEmail("");
        setShowSuccess(true);
        launchConfetti();
      } else {
        setMessage(data.error || "That didn't stick. Try again.");
      }
    } catch {
      setMessage("Couldn't reach the signal. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={subscribe}>
      <Label htmlFor={inputId}>{label}</Label>
      <div className={`${styles.controls} mt-xs`}>
        <Input
          id={inputId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          autoComplete="email"
          required
        />
        <Button
          type="submit"
          aria-label={loading ? "Sending" : buttonLabel}
          disabled={loading || !email.trim()}
          className={styles.submitButton}
        >
          {loading ? (
            <CircleNotch className={styles.spin} size={24} />
          ) : (
            <PaperPlaneTilt strokeWidth={2} size={24} />
          )}
          <span className={styles.buttonText}>
            {loading ? "Sending" : buttonLabel}
          </span>
        </Button>
      </div>
      {message && (
        <p className={styles.message} role="status" aria-live="polite">
          {message}
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
          <div className={styles.successCard}>
            <p className={styles.successMessage}>{successMessage}</p>
            <Button
              type="button"
              onClick={() => setShowSuccess(false)}
              className={styles.doneButton}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
