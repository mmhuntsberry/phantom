ALTER TABLE "reader_applicants" ADD COLUMN "book_id" text;--> statement-breakpoint
ALTER TABLE "reader_applicants" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "reader_applicants" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "reader_applicants" ADD COLUMN "invite_id" integer;--> statement-breakpoint
ALTER TABLE "reading_survey_responses" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "reading_survey_responses" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "reader_applicants" ADD CONSTRAINT "reader_applicants_invite_id_reader_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."reader_invites"("id") ON DELETE no action ON UPDATE no action;