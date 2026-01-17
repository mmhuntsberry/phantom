import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db/index";
import { readingSurveyResponses } from "@/db/schema";
import AdminTokenSetter from "../../../../../components/AdminTokenSetter";
import styles from "./page.module.css";

export const metadata = {
  title: "Survey Detail | Admin",
  description: "Reader survey response detail.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReaderSurveyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const surveyId = Number(params.id);
  if (!Number.isFinite(surveyId)) return notFound();

  const survey = await db
    .select()
    .from(readingSurveyResponses)
    .where(eq(readingSurveyResponses.id, surveyId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!survey) return notFound();

  const answers = survey.answers as Record<string, string> | null;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.title}>Survey response</h1>
        <p className={styles.subtitle}>
          {survey.cohortType.toUpperCase()} · {survey.program}
        </p>
        <p className={styles.subtitle}>
          Submitted: {new Date(survey.submittedAt).toLocaleString()}
        </p>
      </section>

      <AdminTokenSetter />
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Answers</h2>
        <div className={styles.answers}>
          <div className={styles.answerCard}>
            <p className={styles.answerLabel}>Hook moment</p>
            <p className={styles.answerText}>{answers?.hookMoment || ""}</p>
          </div>
          <div className={styles.answerCard}>
            <p className={styles.answerLabel}>Attention drop</p>
            <p className={styles.answerText}>{answers?.attentionDrop || ""}</p>
          </div>
          <div className={styles.answerCard}>
            <p className={styles.answerLabel}>Confusion</p>
            <p className={styles.answerText}>{answers?.confusion || ""}</p>
          </div>
          <div className={styles.answerCard}>
            <p className={styles.answerLabel}>Character realism</p>
            <p className={styles.answerText}>{answers?.characterReal || ""}</p>
          </div>
          <div className={styles.answerCard}>
            <p className={styles.answerLabel}>Keep reading</p>
            <p className={styles.answerText}>{answers?.keepReading || ""}</p>
          </div>
          <div className={styles.answerCard}>
            <p className={styles.answerLabel}>Stop point</p>
            <p className={styles.answerText}>{answers?.stopPoint || ""}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Permissions</h2>
        <div className={styles.permissions}>
          <p className={styles.detail}>
            Testimonial consent: {survey.testimonialConsent ? "yes" : "no"}
          </p>
          <p className={styles.detail}>
            Attribution preference: {survey.attributionPreference || ""}
          </p>
          {survey.firstName && (
            <p className={styles.detail}>
              First name: {survey.firstName}
            </p>
          )}
          {survey.lastName && (
            <p className={styles.detail}>
              Last name: {survey.lastName}
            </p>
          )}
          <p className={styles.detail}>
            Attribution text: {survey.attributionText || ""}
          </p>
          <p className={styles.detail}>
            ARC review intent: {survey.arcReviewIntent ? "yes" : "no"}
          </p>
          <p className={styles.detail}>
            ARC review posted: {survey.arcReviewPosted ? "yes" : "no"}
          </p>
          <p className={styles.detail}>
            ARC review link: {survey.arcReviewLink || ""}
          </p>
        </div>
      </section>
    </div>
  );
}
