"use client";

import { useEffect, useId, useState } from "react";
import Button from "./button/button";
import Input from "./input/input";
import Label from "./label/label";
import styles from "./ReaderSurveyForm.module.css";

type ReaderSurveyFormProps = {
  token: string;
};

export default function ReaderSurveyForm({ token }: ReaderSurveyFormProps) {
  const hookId = useId();
  const attentionId = useId();
  const confusionId = useId();
  const characterId = useId();
  const keepReadingId = useId();
  const stopId = useId();
  const permissionId = useId();
  const attributionPrefId = useId();
  const attributionTextId = useId();
  const arcIntentId = useId();
  const arcPostedId = useId();
  const arcLinkId = useId();
  const honeypotId = useId();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hookMoment, setHookMoment] = useState("");
  const [attentionDrop, setAttentionDrop] = useState("");
  const [confusion, setConfusion] = useState("");
  const [characterReal, setCharacterReal] = useState("");
  const [keepReading, setKeepReading] = useState("");
  const [stopPoint, setStopPoint] = useState("");
  const [testimonialConsent, setTestimonialConsent] = useState(false);
  const [attributionPreference, setAttributionPreference] =
    useState("anonymous");
  const [attributionText, setAttributionText] = useState("");
  const [arcReviewIntent, setArcReviewIntent] = useState(false);
  const [arcReviewPosted, setArcReviewPosted] = useState(false);
  const [arcReviewLink, setArcReviewLink] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cookieMatch = document.cookie
      .split("; ")
      .find((item) => item.startsWith("reader_session="));
    const cookieSession = cookieMatch ? cookieMatch.split("=")[1] : null;
    if (cookieSession) {
      setSessionId(cookieSession);
      return;
    }

    const key = `reader-session-${token}`;
    const currentId = window.localStorage.getItem(key);
    if (currentId) {
      setSessionId(currentId);
    }
  }, [token]);

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
    if (!sessionId) {
      setMessage("Session expired. Please refresh the page.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reader/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          sessionId,
          answers: {
            hookMoment: hookMoment.trim(),
            attentionDrop: attentionDrop.trim(),
            confusion: confusion.trim(),
            characterReal: characterReal.trim(),
            keepReading,
            stopPoint: stopPoint.trim(),
          },
          testimonialConsent,
          attributionPreference,
          attributionText: attributionText.trim(),
          arcReviewIntent,
          arcReviewPosted,
          arcReviewLink: arcReviewLink.trim(),
          honeypot,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Thanks for the feedback. It means a lot.");
        setHookMoment("");
        setAttentionDrop("");
        setConfusion("");
        setCharacterReal("");
        setKeepReading("");
        setStopPoint("");
        setTestimonialConsent(false);
        setAttributionPreference("anonymous");
        setAttributionText("");
        setArcReviewIntent(false);
        setArcReviewPosted(false);
        setArcReviewLink("");
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
          Which character felt most or least real?
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
          type="text"
          value={stopPoint}
          onChange={(event) => setStopPoint(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.checkboxRow}>
          <input
            id={permissionId}
            type="checkbox"
            checked={testimonialConsent}
            onChange={(event) => setTestimonialConsent(event.target.checked)}
          />
          <Label htmlFor={permissionId}>
            You may quote my feedback as a testimonial.
          </Label>
        </div>
      </div>

      <div className={styles.field}>
        <Label htmlFor={attributionPrefId}>Attribution preference</Label>
        <select
          id={attributionPrefId}
          className={styles.select}
          value={attributionPreference}
          onChange={(event) => setAttributionPreference(event.target.value)}
        >
          <option value="anonymous">Anonymous</option>
          <option value="initials">Initials</option>
          <option value="first_name_initial">First name + initial</option>
          <option value="full_name">Full name</option>
        </select>
      </div>

      <div className={styles.field}>
        <Label htmlFor={attributionTextId}>Attribution text (optional)</Label>
        <Input
          id={attributionTextId}
          type="text"
          value={attributionText}
          onChange={(event) => setAttributionText(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.checkboxRow}>
          <input
            id={arcIntentId}
            type="checkbox"
            checked={arcReviewIntent}
            onChange={(event) => setArcReviewIntent(event.target.checked)}
          />
          <Label htmlFor={arcIntentId}>
            I would consider leaving an ARC review.
          </Label>
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.checkboxRow}>
          <input
            id={arcPostedId}
            type="checkbox"
            checked={arcReviewPosted}
            onChange={(event) => setArcReviewPosted(event.target.checked)}
          />
          <Label htmlFor={arcPostedId}>I already posted a review.</Label>
        </div>
      </div>

      <div className={styles.field}>
        <Label htmlFor={arcLinkId}>Review link (optional)</Label>
        <Input
          id={arcLinkId}
          type="text"
          value={arcReviewLink}
          onChange={(event) => setArcReviewLink(event.target.value)}
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
