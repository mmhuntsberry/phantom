import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { db } from "@/db/index";
import { readerInvites, readingSessions } from "@/db/schema";
import { getManuscriptChapters } from "../../../../../sanity/sanity-utils";
import ManuscriptText from "../../../../../components/ManuscriptText";
import ReaderChapterTracker from "../../../../../components/ReaderChapterTracker";
import ReaderSessionTracker from "../../../../../components/ReaderSessionTracker";
import ReaderChapterNavWithProgress from "../../../../../components/ReaderChapterNavWithProgress";
import styles from "../../reader.module.css";

const MANUSCRIPT_KEY = "some-peoples-kids";

export const metadata = {
  title: "Private Reading | Matthew Huntsberry",
  description: "Private manuscript access.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReadFullPage({
  params,
}: {
  params: { program: string };
}) {
  const sessionId = cookies().get("reader_session")?.value;
  const token = cookies().get("reader_token")?.value;
  if (!sessionId) return notFound();

  const session = await db
    .select({ session: readingSessions, invite: readerInvites })
    .from(readingSessions)
    .leftJoin(readerInvites, eq(readingSessions.inviteId, readerInvites.id))
    .where(eq(readingSessions.sessionId, sessionId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!session?.invite || !session.invite.active) return notFound();
  if (session.invite.program !== params.program) return notFound();
  if (session.invite.readingMode !== "full") return notFound();

  const chapters = await getManuscriptChapters({
    manuscriptKey: MANUSCRIPT_KEY,
    startOrder: 1,
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

      <div className={styles.navigationSection}>
        <ReaderChapterNavWithProgress
          sessionId={sessionId}
          chapters={chapters.map((ch) => ({
            order: ch.order,
            chapterLabel: ch.chapterLabel,
            title: ch.title,
          }))}
        />
      </div>

      <section className={styles.chapterList}>
        {chapters.map((chapter) => (
          <article
            className={styles.chapter}
            key={chapter.order}
            data-chapter-order={chapter.order}
          >
            <p className={styles.chapterLabel}>{chapter.chapterLabel}</p>
            {chapter.title && (
              <p className={styles.chapterTitle}>{chapter.title}</p>
            )}
            <ManuscriptText value={chapter.content} />
            <div
              className={styles.chapterEnd}
              data-chapter-end-order={chapter.order}
            />
          </article>
        ))}
      </section>

      <section className={styles.tracker}>
        <div className={styles.trackerHeader}>
          <p className={styles.trackerKicker}>Wrap up</p>
          <h2 className={styles.sectionTitle}>You made it to the end.</h2>
          <p className={styles.sectionIntro}>
            Mark the section complete, then share quick feedback if you have a
            moment.
          </p>
        </div>
        <div className={styles.trackerActions}>
          <ReaderSessionTracker sessionId={sessionId} token={token} />
        </div>
      </section>

      <ReaderChapterTracker sessionId={sessionId} />
    </div>
  );
}
