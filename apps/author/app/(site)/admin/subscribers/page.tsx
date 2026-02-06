import { desc } from "drizzle-orm";

import { db } from "@/db/index";
import { subscribers } from "@/db/schema";
import AdminSubscribersDashboard, {
  SubscriberRow,
} from "../../../../components/AdminSubscribersDashboard";
import AdminSectionNav from "../../../../components/AdminSectionNav";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Subscribers | Admin",
  description: "Subscriber analytics and exports.",
  robots: {
    index: false,
    follow: false,
  },
};

type DayPoint = {
  date: string;
  newSubscribers: number;
};

function toISODate(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildDailySeries(rows: SubscriberRow[]): DayPoint[] {
  if (rows.length === 0) return [];

  const createdDates = rows
    .map((row) => new Date(row.subscribedAt))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  const first = startOfDayUTC(createdDates[0]);
  const last = startOfDayUTC(createdDates[createdDates.length - 1]);

  const countsByDay = new Map<string, number>();
  for (const row of rows) {
    const date = new Date(row.subscribedAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = toISODate(startOfDayUTC(date));
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const series: DayPoint[] = [];
  for (let cursor = first; cursor <= last; cursor = addDays(cursor, 1)) {
    const key = toISODate(cursor);
    series.push({
      date: key,
      newSubscribers: countsByDay.get(key) ?? 0,
    });
  }

  return series;
}

export default async function AdminSubscribersPage() {
  const rows = await db.select().from(subscribers).orderBy(desc(subscribers.subscribedAt));

  const formatted: SubscriberRow[] = rows.map((row) => ({
    id: row.id,
    email: row.email,
    subscribedAt: row.subscribedAt.toISOString(),
    unsubscribed: Boolean(row.unsubscribed),
  }));

  const now = new Date();
  const day7 = new Date(now.getTime() - 7 * 86400000);
  const day30 = new Date(now.getTime() - 30 * 86400000);

  const total = formatted.length;
  const unsubscribedCount = formatted.filter((row) => row.unsubscribed).length;
  const active = total - unsubscribedCount;
  const new7 = formatted.filter((row) => new Date(row.subscribedAt) >= day7).length;
  const new30 = formatted.filter((row) => new Date(row.subscribedAt) >= day30).length;

  const daily = buildDailySeries(formatted);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.title}>Subscribers</h1>
        <p className={styles.subtitle}>Growth, exports, and list management.</p>
      </section>

      <AdminSectionNav />
      <section className={styles.cards}>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Active</p>
          <p className={styles.cardValue}>{active}</p>
          <p className={styles.cardMeta}>Total minus unsubscribed</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>Total</p>
          <p className={styles.cardValue}>{total}</p>
          <p className={styles.cardMeta}>All time</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>New</p>
          <p className={styles.cardValue}>{new7}</p>
          <p className={styles.cardMeta}>Last 7 days</p>
        </div>
        <div className={styles.card}>
          <p className={styles.cardLabel}>New</p>
          <p className={styles.cardValue}>{new30}</p>
          <p className={styles.cardMeta}>Last 30 days</p>
        </div>
      </section>

      <AdminSubscribersDashboard subscribers={formatted} daily={daily} />
    </div>
  );
}
