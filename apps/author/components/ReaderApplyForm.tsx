"use client";

import React, { useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "./button/button";
import Input from "./input/input";
import Label from "./label/label";
import styles from "./ReaderApplyForm.module.css";

type ReaderApplyFormProps = {
  cohortType: "beta" | "arc";
  program: string;
};

const formatOptions = [
  { value: "", label: "Select format (optional)" },
  { value: "web", label: "Web" },
  { value: "epub", label: "EPUB" },
  { value: "pdf", label: "PDF" },
];

export default function ReaderApplyForm({
  cohortType,
  program,
}: ReaderApplyFormProps) {
  const emailId = useId();
  const formatId = useId();
  const notesId = useId();
  const tasteId = useId();
  const sourceId = useId();
  const honeypotId = useId();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [formatPref, setFormatPref] = useState("");
  const [contentNotesAck, setContentNotesAck] = useState(false);
  const [tasteProfile, setTasteProfile] = useState("");
  const [source, setSource] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
          honeypot,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("If selected, you'll receive a private access link.");
        setEmail("");
        setFormatPref("");
        setContentNotesAck(false);
        setTasteProfile("");
        setSource("");
        setHoneypot("");
      } else {
        setMessage(data.error || "Something went wrong. Try again.");
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
        <Label htmlFor={formatId}>Format preference</Label>
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
        <Label htmlFor={tasteId}>What do you like to read? (Optional)</Label>
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
    </form>
  );
}
