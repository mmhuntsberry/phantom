import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Users
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;

/**
 * Subscribers (for email list)
 */
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribed: boolean("unsubscribed").default(false),
});

export type Subscriber = InferSelectModel<typeof subscribers>;

const cohortTypeEnum = pgEnum("cohort_type", ["beta", "arc"]);
const formatPrefEnum = pgEnum("format_pref", ["web", "epub", "pdf"]);
const readingModeEnum = pgEnum("reading_mode", ["partial", "full"]);
const completionMethodEnum = pgEnum("completion_method", [
  "end_reached",
  "survey_submitted",
]);

export const readerApplicants = pgTable("reader_applicants", {
  id: serial("id").primaryKey(),
  cohortType: cohortTypeEnum("cohort_type").notNull(),
  program: text("program").notNull(),
  email: text("email").notNull(),
  formatPref: formatPrefEnum("format_pref"),
  contentNotesAck: boolean("content_notes_ack").default(false).notNull(),
  tasteProfile: text("taste_profile"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ReaderApplicant = InferSelectModel<typeof readerApplicants>;

export const readerInvites = pgTable(
  "reader_invites",
  {
    id: serial("id").primaryKey(),
    token: text("token").notNull(),
    cohortType: cohortTypeEnum("cohort_type").notNull(),
    program: text("program").notNull(),
    readingMode: readingModeEnum("reading_mode").notNull(),
    active: boolean("active").default(true).notNull(),
    email: text("email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("reader_invites_token_unique").on(table.token),
  })
);

export type ReaderInvite = InferSelectModel<typeof readerInvites>;

export const readingSessions = pgTable(
  "reading_sessions",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    inviteId: integer("invite_id").references(() => readerInvites.id),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    completionMethod: completionMethodEnum("completion_method"),
  },
  (table) => ({
    sessionIdUnique: uniqueIndex("reading_sessions_session_id_unique").on(
      table.sessionId
    ),
  })
);

export type ReadingSession = InferSelectModel<typeof readingSessions>;

export const readingEvents = pgTable(
  "reading_events",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => readingSessions.sessionId),
    eventName: text("event_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
  },
  (table) => ({
    sessionIdIdx: index("reading_events_session_id_idx").on(table.sessionId),
  })
);

export type ReadingEvent = InferSelectModel<typeof readingEvents>;

export const readingSurveyResponses = pgTable("reading_survey_responses", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => readingSessions.sessionId),
  cohortType: cohortTypeEnum("cohort_type").notNull(),
  program: text("program").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  answers: jsonb("answers").$type<Record<string, unknown>>().notNull(),
  testimonialConsent: boolean("testimonial_consent").default(false).notNull(),
  attributionPreference: text("attribution_preference"),
  attributionText: text("attribution_text"),
  arcReviewIntent: boolean("arc_review_intent"),
  arcReviewPosted: boolean("arc_review_posted"),
  arcReviewLink: text("arc_review_link"),
});

export type ReadingSurveyResponse = InferSelectModel<
  typeof readingSurveyResponses
>;
