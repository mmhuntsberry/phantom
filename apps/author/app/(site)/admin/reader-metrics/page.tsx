import { desc, eq } from "drizzle-orm";

import { db } from "../../../../db/index";
import {
  readerInvites,
  readingEvents,
  readingSessions,
  readingSurveyResponses,
} from "../../../../db/schema";
import styles from "./page.module.css";
import AdminTokenSetter from "../../../../components/AdminTokenSetter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reader Metrics | Admin",
  description: "Reader completion and survey metrics.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReaderMetricsPage() {
  const invites = await db.select().from(readerInvites);
  const sessions = await db.select().from(readingSessions);
  const surveys = await db
    .select()
    .from(readingSurveyResponses)
    .orderBy(desc(readingSurveyResponses.submittedAt));
  const events = await db
    .select()
    .from(readingEvents)
    .where(eq(readingEvents.eventName, "chapter_end"));

  const totalInvites = invites.length;
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((session) => session.completedAt)
    .length;
  const completionRate = totalSessions
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0;

  const dropOffMap = new Map<number, number>();
  const latestChapterBySession = new Map<string, number>();

  events.forEach((event) => {
    const order = Number(event.meta?.chapterOrder);
    if (!Number.isFinite(order)) return;
    const existing = latestChapterBySession.get(event.sessionId) || 0;
    if (order > existing) latestChapterBySession.set(event.sessionId, order);
  });

  latestChapterBySession.forEach((chapterOrder) => {
    dropOffMap.set(chapterOrder, (dropOffMap.get(chapterOrder) || 0) + 1);
  });

  const dropOffEntries = Array.from(dropOffMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.title}>Reader metrics</h1>
        <p className={styles.subtitle}>
          Completion rate, drop-off chapters, and survey submissions.
        </p>
      </section>

      <AdminTokenSetter />
      <section className={styles.cards}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Invites</p>
          <p className={styles.cardValue}>{totalInvites}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Sessions</p>
          <p className={styles.cardValue}>{totalSessions}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Completion rate</p>
          <p className={styles.cardValue}>{completionRate}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Survey responses</p>
          <p className={styles.cardValue}>{surveys.length}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Drop-off by chapter</h2>
        {dropOffEntries.length === 0 ? (
          <p className={styles.empty}>No drop-off data yet.</p>
        ) : (
          <ul className={styles.list}>
            {dropOffEntries.map(([chapter, count]) => (
              <li key={chapter} className={styles.listItem}>
                Chapter {chapter}: {count}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent surveys</h2>
        {surveys.length === 0 ? (
          <p className={styles.empty}>No surveys yet.</p>
        ) : (
          <ul className={styles.surveyList}>
            {surveys.slice(0, 10).map((survey) => (
              <li key={survey.id} className={styles.surveyItem}>
                <a className={styles.surveyLink} href={`/admin/reader-surveys/${survey.id}`}>
                  <p className={styles.detail}>
                    {survey.cohortType.toUpperCase()} · {survey.program}
                  </p>
                  <p className={styles.detail}>
                    {new Date(survey.submittedAt).toLocaleString()}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
