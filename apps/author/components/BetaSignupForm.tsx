"use client";

import React, { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./button/button";
import Input from "./input/input";
import Label from "./label/label";
import styles from "./BetaForm.module.css";

type BetaSignupFormProps = {
  packetId?: string;
};

const formatOptions = [
  { value: "", label: "Select format" },
  { value: "web", label: "Web" },
  { value: "epub", label: "EPUB" },
  { value: "pdf", label: "PDF" },
];

export default function BetaSignupForm({
  packetId,
}: BetaSignupFormProps) {
  const emailId = useId();
  const formatId = useId();
  const consentId = useId();
  const readingId = useId();
  const referralId = useId();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [formatPreference, setFormatPreference] = useState("");
  const [consent, setConsent] = useState(false);
  const [readingPreferences, setReadingPreferences] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!email.trim() || !email.includes("@")) {
      nextErrors.email = "Enter a valid email.";
    }
    if (!formatPreference) {
      nextErrors.formatPreference = "Choose a format.";
    }
    if (!consent) {
      nextErrors.consent = "Consent is required to join.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/beta-applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          formatPreference,
          consent,
          readingPreferences: readingPreferences.trim(),
          referralSource: referralSource.trim(),
          packetId,
          honeypot: company,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/beta-thanks");
        setEmail("");
        setFormatPreference("");
        setConsent(false);
        setReadingPreferences("");
        setReferralSource("");
      } else {
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch (error) {
      setMessage("Couldn't submit right now. Please try again later.");
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
          value={formatPreference}
          onChange={(event) => setFormatPreference(event.target.value)}
          aria-describedby={
            errors.formatPreference ? `${formatId}-error` : undefined
          }
          required
        >
          {formatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.formatPreference && (
          <p className={styles.error} id={`${formatId}-error`}>
            {errors.formatPreference}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.checkboxRow}>
          <input
            id={consentId}
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            aria-describedby={errors.consent ? `${consentId}-error` : undefined}
            required
          />
          <Label htmlFor={consentId}>
            I understand this is an advance draft and will keep it private.
          </Label>
        </div>
        {errors.consent && (
          <p className={styles.error} id={`${consentId}-error`}>
            {errors.consent}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor={readingId}>What do you like to read? (Optional)</Label>
        <Input
          id={readingId}
          type="text"
          value={readingPreferences}
          onChange={(event) => setReadingPreferences(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor={referralId}>Where did you find this? (Optional)</Label>
        <Input
          id={referralId}
          type="text"
          value={referralSource}
          onChange={(event) => setReferralSource(event.target.value)}
        />
      </div>

      <div className={styles.hiddenField} aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting" : "Join the beta"}
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
