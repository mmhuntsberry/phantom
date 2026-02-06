import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db/index";
import {
  readerInvites,
  readingEvents,
  readingSessions,
  readingSurveyResponses,
} from "@/db/schema";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reader Session | Admin",
  description: "Reader session detail and event timeline.",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value: Date | null) {
  if (!value) return "—";
  return value.toLocaleString();
}

export default async function ReaderSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const session = await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.sessionId, params.sessionId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!session) return notFound();

  const invite = session.inviteId
    ? await db
        .select()
        .from(readerInvites)
        .where(eq(readerInvites.id, session.inviteId))
        .limit(1)
        .then((rows) => rows[0])
    : null;

  const survey = await db
    .select()
    .from(readingSurveyResponses)
    .where(eq(readingSurveyResponses.sessionId, session.sessionId))
    .limit(1)
    .then((rows) => rows[0]);

  const events = await db
    .select()
    .from(readingEvents)
    .where(eq(readingEvents.sessionId, session.sessionId))
    .orderBy(desc(readingEvents.createdAt));

  const latestChapter = events.reduce((max, event) => {
    const order = Number(event.meta?.chapterOrder);
    if (!Number.isFinite(order)) return max;
    return Math.max(max, order);
  }, 0);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.title}>Reader session</h1>
        <p className={styles.subtitle}>
          Session {session.sessionId}
        </p>
      </section>

      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <p className={styles.label}>Reader</p>
          <p className={styles.value}>{invite?.email || "Unknown"}</p>
          <p className={styles.meta}>
            {invite?.cohortType?.toUpperCase() || "—"} ·{" "}
            {invite?.readingMode || "—"}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.label}>Program</p>
          <p className={styles.value}>{invite?.program || "—"}</p>
          <p className={styles.meta}>
            Invited {formatDate(invite?.createdAt || null)}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.label}>Progress</p>
          <p className={styles.value}>
            {latestChapter ? `Chapter ${latestChapter}` : "—"}
          </p>
          <p className={styles.meta}>
            {session.completedAt ? "Completed" : "In progress"}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.label}>Survey</p>
          <p className={styles.value}>{survey ? "Submitted" : "—"}</p>
          <p className={styles.meta}>
            {survey?.submittedAt ? formatDate(survey.submittedAt) : ""}
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Timeline</h2>
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <p className={styles.detail}>Session started</p>
            <p className={styles.meta}>{formatDate(session.startedAt)}</p>
          </div>
          <div className={styles.timelineItem}>
            <p className={styles.detail}>Last seen</p>
            <p className={styles.meta}>{formatDate(session.lastSeenAt)}</p>
          </div>
          <div className={styles.timelineItem}>
            <p className={styles.detail}>Completed at</p>
            <p className={styles.meta}>{formatDate(session.completedAt)}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Events</h2>
        {events.length === 0 ? (
          <p className={styles.empty}>No events yet.</p>
        ) : (
          <ul className={styles.eventList}>
            {events.map((event) => {
              const chapterOrder =
                event.meta &&
                typeof event.meta === "object" &&
                "chapterOrder" in event.meta
                  ? event.meta.chapterOrder
                  : null;
              return (
                <li key={event.id} className={styles.eventItem}>
                  <div>
                    <p className={styles.detail}>{event.eventName}</p>
                    {chapterOrder != null && (
                      <p className={styles.meta}>
                        Chapter {String(chapterOrder)}
                      </p>
                    )}
                  </div>
                  <p className={styles.meta}>{formatDate(event.createdAt)}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Survey response</h2>
        {survey ? (
          <a
            className={styles.surveyLink}
            href={`/admin/reader-surveys/${survey.id}`}
          >
            View survey #{survey.id}
          </a>
        ) : (
          <p className={styles.empty}>No survey submitted.</p>
        )}
      </section>

      <a className={styles.backLink} href="/admin/reader-metrics">
        Back to metrics
      </a>
    </div>
  );
}
