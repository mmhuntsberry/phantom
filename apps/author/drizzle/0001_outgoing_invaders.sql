DO $$ BEGIN
  CREATE TYPE "cohort_type" AS ENUM ('beta', 'arc');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "format_pref" AS ENUM ('web', 'epub', 'pdf');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "reading_mode" AS ENUM ('partial', 'full');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "completion_method" AS ENUM ('end_reached', 'survey_submitted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reader_applicants" (
	"id" serial PRIMARY KEY NOT NULL,
	"cohort_type" "cohort_type" NOT NULL,
	"program" text NOT NULL,
	"email" text NOT NULL,
	"format_pref" "format_pref",
	"content_notes_ack" boolean DEFAULT false NOT NULL,
	"taste_profile" text,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reader_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"cohort_type" "cohort_type" NOT NULL,
	"program" text NOT NULL,
	"reading_mode" "reading_mode" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reading_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"event_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reading_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"invite_id" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"completion_method" "completion_method"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reading_survey_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"cohort_type" "cohort_type" NOT NULL,
	"program" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"answers" jsonb NOT NULL,
	"testimonial_consent" boolean DEFAULT false NOT NULL,
	"attribution_preference" text,
	"attribution_text" text,
	"arc_review_intent" boolean,
	"arc_review_posted" boolean,
	"arc_review_link" text
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reading_events" ADD CONSTRAINT "reading_events_session_id_reading_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reading_sessions"("session_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_invite_id_reader_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."reader_invites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reading_survey_responses" ADD CONSTRAINT "reading_survey_responses_session_id_reading_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reading_sessions"("session_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reader_invites_token_unique" ON "reader_invites" USING btree ("token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reading_events_session_id_idx" ON "reading_events" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reading_sessions_session_id_unique" ON "reading_sessions" USING btree ("session_id");
