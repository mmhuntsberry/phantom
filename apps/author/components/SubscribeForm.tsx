"use client";

import React, { useId, useState } from "react";
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
        setMessage(successMessage);
        setEmail("");
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
    </form>
  );
}
