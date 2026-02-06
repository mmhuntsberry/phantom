"use client";

import React, { useId, useState } from "react";
import Button from "./button/button";
import Input from "./input/input";
import Label from "./label/label";
import styles from "./BetaForm.module.css";

type BetaSurveyFormProps = {
  packetId?: string;
};

export default function BetaSurveyForm({ packetId }: BetaSurveyFormProps) {
  const hookId = useId();
  const attentionId = useId();
  const confusionId = useId();
  const characterId = useId();
  const keepReadingId = useId();
  const stopId = useId();
  const permissionId = useId();
  const attributionId = useId();
  const attributionNameId = useId();

  const [hookMoment, setHookMoment] = useState("");
  const [attentionDrop, setAttentionDrop] = useState("");
  const [confusion, setConfusion] = useState("");
  const [characterReal, setCharacterReal] = useState("");
  const [keepReading, setKeepReading] = useState("");
  const [stopPoint, setStopPoint] = useState("");
  const [testimonialPermission, setTestimonialPermission] = useState(false);
  const [attributionPreference, setAttributionPreference] = useState("anonymous");
  const [attributionName, setAttributionName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!hookMoment.trim()) nextErrors.hookMoment = "This is required.";
    if (!confusion.trim()) nextErrors.confusion = "This is required.";
    if (!characterReal.trim()) nextErrors.characterReal = "This is required.";
    if (!keepReading) nextErrors.keepReading = "Select one option.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/beta-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packetId,
          hookMoment: hookMoment.trim(),
          attentionDrop: attentionDrop.trim(),
          confusion: confusion.trim(),
          characterReal: characterReal.trim(),
          keepReading,
          stopPoint: stopPoint.trim(),
          testimonialPermission,
          attributionPreference,
          attributionName: attributionName.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Thanks for the feedback. You're helping shape the story.");
        setHookMoment("");
        setAttentionDrop("");
        setConfusion("");
        setCharacterReal("");
        setKeepReading("");
        setStopPoint("");
        setTestimonialPermission(false);
        setAttributionPreference("anonymous");
        setAttributionName("");
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
        <Label htmlFor={hookId}>Where were you most hooked?</Label>
        <textarea
          id={hookId}
          className={styles.textarea}
          value={hookMoment}
          onChange={(event) => setHookMoment(event.target.value)}
          aria-describedby={errors.hookMoment ? `${hookId}-error` : undefined}
          required
        />
        {errors.hookMoment && (
          <p className={styles.error} id={`${hookId}-error`}>
            {errors.hookMoment}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor={attentionId}>Where did your attention drop?</Label>
        <textarea
          id={attentionId}
          className={styles.textarea}
          value={attentionDrop}
          onChange={(event) => setAttentionDrop(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor={confusionId}>Where were you confused?</Label>
        <textarea
          id={confusionId}
          className={styles.textarea}
          value={confusion}
          onChange={(event) => setConfusion(event.target.value)}
          aria-describedby={errors.confusion ? `${confusionId}-error` : undefined}
          required
        />
        {errors.confusion && (
          <p className={styles.error} id={`${confusionId}-error`}>
            {errors.confusion}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor={characterId}>
          Which character felt most real or least real?
        </Label>
        <textarea
          id={characterId}
          className={styles.textarea}
          value={characterReal}
          onChange={(event) => setCharacterReal(event.target.value)}
          aria-describedby={
            errors.characterReal ? `${characterId}-error` : undefined
          }
          required
        />
        {errors.characterReal && (
          <p className={styles.error} id={`${characterId}-error`}>
            {errors.characterReal}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor={keepReadingId}>Would you keep reading?</Label>
        <select
          id={keepReadingId}
          className={styles.select}
          value={keepReading}
          onChange={(event) => setKeepReading(event.target.value)}
          aria-describedby={
            errors.keepReading ? `${keepReadingId}-error` : undefined
          }
          required
        >
          <option value="">Select one</option>
          <option value="yes">Yes</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </select>
        {errors.keepReading && (
          <p className={styles.error} id={`${keepReadingId}-error`}>
            {errors.keepReading}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor={stopId}>If you stopped, where?</Label>
        <Input
          id={stopId}
          value={stopPoint}
          onChange={(event) => setStopPoint(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.checkboxRow}>
          <input
            id={permissionId}
            type="checkbox"
            checked={testimonialPermission}
            onChange={(event) => setTestimonialPermission(event.target.checked)}
          />
          <Label htmlFor={permissionId}>
            You may quote my feedback as a testimonial.
          </Label>
        </div>
      </div>

      <div className={styles.field}>
        <Label htmlFor={attributionId}>Attribution preference</Label>
        <select
          id={attributionId}
          className={styles.select}
          value={attributionPreference}
          onChange={(event) => setAttributionPreference(event.target.value)}
        >
          <option value="anonymous">Anonymous</option>
          <option value="initials">Initials</option>
          <option value="firstNameInitial">First name + initial</option>
          <option value="fullName">Full name</option>
        </select>
      </div>

      <div className={styles.field}>
        <Label htmlFor={attributionNameId}>Name (optional)</Label>
        <Input
          id={attributionNameId}
          value={attributionName}
          onChange={(event) => setAttributionName(event.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting" : "Submit feedback"}
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
