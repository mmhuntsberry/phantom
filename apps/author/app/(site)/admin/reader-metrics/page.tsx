import { desc } from "drizzle-orm";

import { db } from "@/db/index";
import {
  readerInvites,
  readingEvents,
  readingSessions,
  readingSurveyResponses,
} from "@/db/schema";
import styles from "./page.module.css";
import AdminSectionNav from "../../../../components/AdminSectionNav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reader Metrics | Admin",
  description: "Reader completion and survey metrics.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReaderMetricsPage({
  searchParams,
}: {
  searchParams?: {
      range?: string;
      program?: string;
      cohort?: string;
      mode?: string;
  };
}) {
  const invites = await db.select().from(readerInvites);
  const sessions = await db.select().from(readingSessions);
  const surveys = await db
    .select()
    .from(readingSurveyResponses)
    .orderBy(desc(readingSurveyResponses.submittedAt));
  const events = await db.select().from(readingEvents);

  const programFilter = searchParams?.program || "all";
  const cohortFilter = searchParams?.cohort || "all";
  const modeFilter = searchParams?.mode || "all";
  const rangeFilter = searchParams?.range || "30";

  const rangeDays =
    rangeFilter === "7" ? 7 : rangeFilter === "all" ? null : 30;
  const cutoff =
    rangeDays === null ? null : new Date(Date.now() - rangeDays * 86400000);

  const totalInvites = invites.length;
  const activeInvites = invites.filter((invite) => invite.active).length;

  const dropOffMap = new Map<number, number>();
  const progressBySession = new Map<
    string,
    { maxChapter: number; lastEventAt: Date | null }
  >();
  const surveyBySession = new Map<string, (typeof surveys)[number]>();
  const inviteById = new Map<number, (typeof invites)[number]>();

  invites.forEach((invite) => {
    inviteById.set(invite.id, invite);
  });

  surveys.forEach((survey) => {
    surveyBySession.set(survey.sessionId, survey);
  });

  events.forEach((event) => {
    if (
      event.eventName !== "chapter_view" &&
      event.eventName !== "chapter_end"
    ) {
      return;
    }
    const order = Number(event.meta?.chapterOrder);
    if (!Number.isFinite(order)) return;
    const existing = progressBySession.get(event.sessionId) || {
      maxChapter: 0,
      lastEventAt: null,
    };
    const nextMax = Math.max(existing.maxChapter, order);
    const nextLast = event.createdAt
      ? new Date(event.createdAt)
      : existing.lastEventAt;
    progressBySession.set(event.sessionId, {
      maxChapter: nextMax,
      lastEventAt: nextLast,
    });
  });

  function matchesFilters(invite: (typeof invites)[number] | null) {
    if (programFilter !== "all" && invite?.program !== programFilter) {
      return false;
    }
    if (cohortFilter !== "all" && invite?.cohortType !== cohortFilter) {
      return false;
    }
    if (modeFilter !== "all" && invite?.readingMode !== modeFilter) {
      return false;
    }
    return true;
  }

  const filteredInvites = invites.filter((invite) => {
    if (!matchesFilters(invite)) return false;
    if (!cutoff) return true;
    return invite.createdAt ? invite.createdAt >= cutoff : true;
  });

  const filteredSessions = sessions.filter((session) => {
    const invite = session.inviteId
      ? inviteById.get(session.inviteId) ?? null
      : null;
    if (!matchesFilters(invite)) return false;
    if (!cutoff) return true;
    return session.startedAt ? session.startedAt >= cutoff : true;
  });

  const filteredSessionIds = new Set(
    filteredSessions.map((session) => session.sessionId)
  );

  const filteredSurveys = surveys.filter((survey) => {
    if (!filteredSessionIds.has(survey.sessionId)) return false;
    if (!cutoff) return true;
    return survey.submittedAt ? survey.submittedAt >= cutoff : true;
  });

  const filteredEvents = events.filter((event) => {
    if (!filteredSessionIds.has(event.sessionId)) return false;
    if (!cutoff) return true;
    return event.createdAt ? event.createdAt >= cutoff : true;
  });

  const totalSessions = filteredSessions.length;
  const completedSessions = filteredSessions.filter(
    (session) => session.completedAt
  ).length;
  const completionRate = totalSessions
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0;
  const surveyRate = totalSessions
    ? Math.round((filteredSurveys.length / totalSessions) * 100)
    : 0;

  progressBySession.forEach(({ maxChapter }, sessionId) => {
    if (!filteredSessionIds.has(sessionId)) return;
    if (!maxChapter) return;
    dropOffMap.set(maxChapter, (dropOffMap.get(maxChapter) || 0) + 1);
  });

  const dropOffEntries = Array.from(dropOffMap.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const dropOffMax = dropOffEntries.length
    ? Math.max(...dropOffEntries.map((entry) => entry[1]))
    : 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSessions = filteredSessions.filter(
    (session) => session.startedAt && session.startedAt >= sevenDaysAgo
  );
  const recentSurveys = filteredSurveys.filter(
    (survey) => survey.submittedAt && survey.submittedAt >= sevenDaysAgo
  );

  const completionDurations = filteredSessions
    .filter((session) => session.completedAt)
    .map((session) => {
      const started = session.startedAt
        ? new Date(session.startedAt).getTime()
        : null;
      const completed = session.completedAt
        ? new Date(session.completedAt).getTime()
        : null;
      if (!started || !completed) return null;
      return completed - started;
    })
    .filter((value): value is number => Number.isFinite(value));

  const surveyDurations = filteredSessions
    .map((session) => {
      const survey = surveyBySession.get(session.sessionId);
      if (!survey?.submittedAt || !session.completedAt) return null;
      const completed = new Date(session.completedAt).getTime();
      const submitted = new Date(survey.submittedAt).getTime();
      return submitted - completed;
    })
    .filter(
      (value): value is number =>
        value !== null && Number.isFinite(value) && value >= 0
    );

  function medianMs(values: number[]) {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }
    return sorted[mid];
  }

  function formatDuration(ms: number | null) {
    if (!ms || ms <= 0) return "—";
    const minutes = Math.round(ms / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  }

  const medianCompletion = formatDuration(medianMs(completionDurations));
  const medianSurveyDelay = formatDuration(medianMs(surveyDurations));

  const sessionRows = [...filteredSessions]
    .sort((a, b) => {
      const left = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
      const right = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
      return right - left;
    })
    .map((session) => {
      const invite = session.inviteId
        ? inviteById.get(session.inviteId)
        : null;
      const progress = progressBySession.get(session.sessionId);
      const survey = surveyBySession.get(session.sessionId);
      return {
        sessionId: session.sessionId,
        email: invite?.email || "Unknown",
        cohortType: invite?.cohortType || "—",
        program: invite?.program || "—",
        readingMode: invite?.readingMode || "—",
        startedAt: session.startedAt,
        lastSeenAt: session.lastSeenAt,
        completedAt: session.completedAt,
        completionMethod: session.completionMethod || "—",
        latestChapter: progress?.maxChapter || 0,
        surveyId: survey?.id,
        surveyAt: survey?.submittedAt,
      };
    });

  const programs = Array.from(
    new Set(invites.map((invite) => invite.program))
  ).filter(Boolean);
  const cohorts = Array.from(
    new Set(invites.map((invite) => invite.cohortType))
  ).filter(Boolean);
  const modes = Array.from(
    new Set(invites.map((invite) => invite.readingMode))
  ).filter(Boolean);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.title}>Reader metrics</h1>
        <p className={styles.subtitle}>
          Completion rate, drop-off chapters, and survey submissions.
        </p>
      </section>

      <AdminSectionNav />
      <section className={styles.filters}>
        <div className={styles.filterHeader}>
          <p className={styles.filterKicker}>Filters</p>
          <p className={styles.filterMeta}>
            Showing {totalSessions} sessions · {filteredSurveys.length} surveys
          </p>
        </div>
        <form className={styles.filterGrid} method="get">
          <label className={styles.filterGroup}>
            <span>Time range</span>
            <select
              className={styles.filterSelect}
              name="range"
              defaultValue={rangeFilter}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </label>
          <label className={styles.filterGroup}>
            <span>Program</span>
            <select
              className={styles.filterSelect}
              name="program"
              defaultValue={programFilter}
            >
              <option value="all">All programs</option>
              {programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterGroup}>
            <span>Cohort</span>
            <select
              className={styles.filterSelect}
              name="cohort"
              defaultValue={cohortFilter}
            >
              <option value="all">All cohorts</option>
              {cohorts.map((cohort) => (
                <option key={cohort} value={cohort}>
                  {cohort.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterGroup}>
            <span>Reading mode</span>
            <select
              className={styles.filterSelect}
              name="mode"
              defaultValue={modeFilter}
            >
              <option value="all">All modes</option>
              {modes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.filterActions}>
            <button className={styles.filterButton} type="submit">
              Apply
            </button>
            <a className={styles.filterLink} href="/admin/reader-metrics">
              Reset
            </a>
          </div>
        </form>
      </section>
      <section className={styles.cards}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Invites</p>
          <p className={styles.cardValue}>{filteredInvites.length}</p>
          <p className={styles.cardMeta}>
            {activeInvites} active · {totalInvites} total
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Sessions</p>
          <p className={styles.cardValue}>{totalSessions}</p>
          <p className={styles.cardMeta}>{recentSessions.length} last 7d</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Completion rate</p>
          <p className={styles.cardValue}>{completionRate}%</p>
          <p className={styles.cardMeta}>{completedSessions} completed</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Survey rate</p>
          <p className={styles.cardValue}>{surveyRate}%</p>
          <p className={styles.cardMeta}>
            {filteredSurveys.length} responses · {recentSurveys.length} last 7d
          </p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Median read time</p>
          <p className={styles.cardValue}>{medianCompletion}</p>
          <p className={styles.cardMeta}>From start to finish</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Survey delay</p>
          <p className={styles.cardValue}>{medianSurveyDelay}</p>
          <p className={styles.cardMeta}>After completion</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Funnel snapshot</h2>
        <div className={styles.funnel}>
          <div className={styles.funnelStep}>
            <p className={styles.funnelLabel}>Invited</p>
            <p className={styles.funnelValue}>{filteredInvites.length}</p>
          </div>
          <div className={styles.funnelStep}>
            <p className={styles.funnelLabel}>Started</p>
            <p className={styles.funnelValue}>{totalSessions}</p>
          </div>
          <div className={styles.funnelStep}>
            <p className={styles.funnelLabel}>Finished</p>
            <p className={styles.funnelValue}>{completedSessions}</p>
          </div>
          <div className={styles.funnelStep}>
            <p className={styles.funnelLabel}>Surveyed</p>
            <p className={styles.funnelValue}>{filteredSurveys.length}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Drop-off by chapter</h2>
        {dropOffEntries.length === 0 ? (
          <p className={styles.empty}>No drop-off data yet.</p>
        ) : (
          <ul className={styles.dropList}>
            {dropOffEntries.map(([chapter, count]) => (
              <li key={chapter} className={styles.dropItem}>
                <div className={styles.dropMeta}>
                  <p className={styles.detail}>Chapter {chapter}</p>
                  <p className={styles.detail}>{count} readers</p>
                </div>
                <div className={styles.dropBar}>
                  <span
                    className={styles.dropFill}
                    style={{
                      width: dropOffMax
                        ? `${Math.round((count / dropOffMax) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent surveys</h2>
        {filteredSurveys.length === 0 ? (
          <p className={styles.empty}>No surveys yet.</p>
        ) : (
          <ul className={styles.surveyList}>
            {filteredSurveys.slice(0, 10).map((survey) => (
              <li key={survey.id} className={styles.surveyItem}>
                <a
                  className={styles.surveyLink}
                  href={`/admin/reader-surveys/${survey.id}`}
                >
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Reader sessions</h2>
        {sessionRows.length === 0 ? (
          <p className={styles.empty}>No sessions yet.</p>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Email</span>
              <span>Program</span>
              <span>Progress</span>
              <span>Status</span>
              <span>Last seen</span>
              <span>Survey</span>
            </div>
            {sessionRows.map((row) => (
              <div key={row.sessionId} className={styles.tableRow}>
                <div className={styles.cellPrimary}>
                  <a
                    className={styles.rowLink}
                    href={`/admin/reader-metrics/${row.sessionId}`}
                  >
                    {row.email}
                  </a>
                  <p className={styles.muted}>
                    {row.cohortType.toUpperCase()} · {row.readingMode}
                  </p>
                </div>
                <p className={styles.detail}>{row.program}</p>
                <p className={styles.detail}>
                  {row.latestChapter ? `Chapter ${row.latestChapter}` : "—"}
                </p>
                <p className={styles.detail}>
                  {row.completedAt ? "Completed" : "In progress"}
                </p>
                <p className={styles.detail}>
                  {row.lastSeenAt
                    ? new Date(row.lastSeenAt).toLocaleDateString()
                    : "—"}
                </p>
                {row.surveyId ? (
                  <a
                    className={styles.surveyLink}
                    href={`/admin/reader-surveys/${row.surveyId}`}
                  >
                    <span className={styles.detail}>View</span>
                    <span className={styles.muted}>
                      {row.surveyAt
                        ? new Date(row.surveyAt).toLocaleDateString()
                        : ""}
                    </span>
                  </a>
                ) : (
                  <p className={styles.detail}>—</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
