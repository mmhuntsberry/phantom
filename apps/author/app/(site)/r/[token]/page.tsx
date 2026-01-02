import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "../../../../db/index";
import { readerInvites } from "../../../../db/schema";
import { getManuscriptChapters } from "../../../../sanity/sanity-utils";
import RichText from "../../../../components/RichText";
import ReaderSessionTracker from "../../../../components/ReaderSessionTracker";
import styles from "./page.module.css";

const MANUSCRIPT_KEY = "some-peoples-kids";

export const metadata = {
  title: "Private Reading | Matthew Huntsberry",
  description: "Private manuscript access.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReaderTokenPage({
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

  const startOrder = 1;
  const endOrder = invite.readingMode === "partial" ? 3 : undefined;

  const chapters = await getManuscriptChapters({
    manuscriptKey: MANUSCRIPT_KEY,
    startOrder,
    endOrder,
  });

  if (chapters.length === 0) return notFound();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Private Reading</p>
        <h1 className={styles.title}>Thanks for reading early.</h1>
        <p className={styles.subtitle}>
          This link is private. Please do not share it publicly.
        </p>
      </section>

      <section className={styles.chapterList}>
        {chapters.map((chapter) => (
          <article className={styles.chapter} key={chapter.order}>
            <p className={styles.chapterLabel}>
              {chapter.chapterLabel}
              {chapter.title ? `: ${chapter.title}` : ""}
            </p>
            <RichText value={chapter.content} />
          </article>
        ))}
      </section>

      <section className={styles.tracker}>
        <h2 className={styles.sectionTitle}>Wrap up</h2>
        <p className={styles.sectionIntro}>
          When you finish this section, click below to mark it complete.
        </p>
        <ReaderSessionTracker token={params.token} />
      </section>
    </div>
  );
}
