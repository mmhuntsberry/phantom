ALTER TABLE "reader_applicants" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE "reader_applicants" ADD COLUMN IF NOT EXISTS "approved_at" timestamp;
--> statement-breakpoint
ALTER TABLE "reader_applicants" ADD COLUMN IF NOT EXISTS "invite_id" integer;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reader_applicants" ADD CONSTRAINT "reader_applicants_invite_id_reader_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."reader_invites"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
