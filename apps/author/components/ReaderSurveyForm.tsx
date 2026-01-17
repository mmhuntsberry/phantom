"use client";

import { useEffect, useMemo, useId, useState } from "react";
import { useRouter } from "next/navigation";
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
  const firstNameId = useId();
  const lastNameId = useId();
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [arcReviewIntent, setArcReviewIntent] = useState(false);
  const [arcReviewPosted, setArcReviewPosted] = useState(false);
  const [arcReviewLink, setArcReviewLink] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
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
  const router = useRouter();

  const confettiColors = useMemo(
    () => ["#f97316", "#f59e0b", "#fbbf24", "#10b981", "#0ea5e9"],
    []
  );

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
      router.push("/");
    }, 2800);
    return () => window.clearTimeout(timeout);
  }, [router, showSuccess]);

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
    if (!hookMoment.trim()) nextErrors.hookMoment = "This is required.";
    if (!confusion.trim()) nextErrors.confusion = "This is required.";
    if (!characterReal.trim()) nextErrors.characterReal = "This is required.";
    if (!keepReading) nextErrors.keepReading = "Select one option.";
    
    // Require firstName and lastName when testimonial consent is given
    if (testimonialConsent) {
      if (!firstName.trim()) nextErrors.firstName = "First name is required when allowing testimonial use.";
      if (!lastName.trim()) nextErrors.lastName = "Last name is required when allowing testimonial use.";
    }
    
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
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          arcReviewIntent,
          arcReviewPosted,
          arcReviewLink: arcReviewLink.trim(),
          honeypot,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("");
        setShowSuccess(true);
        launchConfetti();
        setHookMoment("");
        setAttentionDrop("");
        setConfusion("");
        setCharacterReal("");
        setKeepReading("");
        setStopPoint("");
        setTestimonialConsent(false);
        setAttributionPreference("anonymous");
        setAttributionText("");
        setFirstName("");
        setLastName("");
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
        <Label htmlFor={hookId}>Initial thoughts: what stood out first?</Label>
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
        <Label htmlFor={attentionId}>
          Where did your attention slow down or wander?
        </Label>
        <textarea
          id={attentionId}
          className={styles.textarea}
          value={attentionDrop}
          onChange={(event) => setAttentionDrop(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <Label htmlFor={confusionId}>
          What parts raised questions or felt unclear?
        </Label>
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
          Which characters stood out to you, and why?
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
        <Label htmlFor={keepReadingId}>
          How likely are you to keep reading?
        </Label>
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
          <option value="yes">Very likely</option>
          <option value="maybe">Somewhat likely</option>
          <option value="no">Unlikely</option>
        </select>
        {errors.keepReading && (
          <p className={styles.error} id={`${keepReadingId}-error`}>
            {errors.keepReading}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor={stopId}>
          If you paused or stopped, where did that happen?
        </Label>
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
          <Label htmlFor={permissionId}>Can I quote this?</Label>
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

      {testimonialConsent && (
        <>
          <div className={styles.field}>
            <Label htmlFor={firstNameId}>
              First name <span className={styles.required}>*</span>
            </Label>
            <Input
              id={firstNameId}
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              aria-describedby={errors.firstName ? `${firstNameId}-error` : undefined}
              required
            />
            {errors.firstName && (
              <p className={styles.error} id={`${firstNameId}-error`}>
                {errors.firstName}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <Label htmlFor={lastNameId}>
              Last name <span className={styles.required}>*</span>
            </Label>
            <Input
              id={lastNameId}
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              aria-describedby={errors.lastName ? `${lastNameId}-error` : undefined}
              required
            />
            {errors.lastName && (
              <p className={styles.error} id={`${lastNameId}-error`}>
                {errors.lastName}
              </p>
            )}
          </div>
        </>
      )}

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
            <p className={styles.modalKicker}>Feedback received</p>
            <h3 className={styles.modalTitle}>Thank you for the notes.</h3>
            <p className={styles.modalBody}>
              Redirecting you back to Start Here.
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
