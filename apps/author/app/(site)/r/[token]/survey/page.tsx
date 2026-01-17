import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db/index";
import { readerInvites } from "@/db/schema";
import ReaderSurveyForm from "../../../../../components/ReaderSurveyForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Reader Survey | Matthew Huntsberry",
  description: "Private reader feedback survey.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReaderSurveyPage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await db
    .select()
    .from(readerInvites)
    .where(eq(readerInvites.token, params.token))
    .limit(1)
    .then((rows) => rows[0]);

  if (!invite || !invite.active) return notFound();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Survey</p>
        <h1 className={styles.title}>2-minute feedback</h1>
        <p className={styles.subtitle}>
          Thank you for reading. Your answers help strengthen the draft.
        </p>
      </section>

      <ReaderSurveyForm token={params.token} />
    </div>
  );
}
