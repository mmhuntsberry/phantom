# Author Platform + Beta/ARC Expansion Plan (apps/author)

## Status (Current)
Completed:
- Public pages: `/start-here`, `/books`, `/books/[slug]`, `/about`, `/newsletter`.
- Public signup: `/beta-readers`, `/arc-readers` with `/api/reader/apply`.
- Admin approval: `/admin/reader-applicants` with `/api/admin/reader/approve`.
- Token gate: `/r/[token]` + reader sessions.
- Reading pages: `/read/partial/[program]` and `/read/full/[program]`.
- Survey: `/r/[token]/survey` + `/api/reader/survey`.
- Analytics: `/api/reader/event` + session tracking.
- Admin metrics: `/admin/reader-metrics` and `/admin/reader-surveys/[id]`.
- Sanity `manuscriptChapter` schema + utilities.
- Drizzle schema + migrations for readers/arc flows.
- Playwright E2E tests (apply flow + approved flow).

Remaining / optional:
- Add Playwright CI wiring + test DB branch (if desired).
- Add `0002_snapshot.json` to Drizzle meta (optional housekeeping).

## Repo Snapshot (apps/author)
- Router: Next.js App Router with route groups in `apps/author/app/(site)` and `apps/author/app/(studio)`.
- Layouts: `apps/author/app/(site)/layout.tsx` wraps header + main, uses `apps/author/app/global.css` tokens.
- Components: `apps/author/components` includes header/nav, button, input, label, and other site-specific primitives.
- Tokens/Theme: CSS custom properties in `apps/author/app/global.css` for spacing, typography (`--fs-*`), palette, and utilities.
- DB (Drizzle + Neon): `apps/author/db/index.ts` and `apps/author/db/schema.ts` define `users` + `subscribers`.
- Subscribe flow: `apps/author/app/api/subscribe/route.ts` writes to `subscribers` table.
- Sanity: schemas in `apps/author/sanity/schemas`, queries in `apps/author/sanity/sanity-utils.ts`.

## Goals
- Add IA pages for reader onboarding and books.
- Introduce Beta/ARC flows with approval + token-gated access.
- Track completion and drop-off per chapter.
- Collect survey feedback and testimonial permissions.
- Use existing design system/tokens/layouts; no new styling frameworks.

## New Public Pages (App Router)
- `/start-here` (reader onramp, curated links + subscribe CTA)
- `/books` (index) and `/books/[slug]` (detail)
- `/about` (reader-facing bio, photo + CTA)
- `/newsletter` (upgrade existing subscribe UX, retain existing subscribe API)

## Beta + ARC Flow (Current)
1) **Public signup link**: `/beta-readers` and `/arc-readers`.
2) **Manual approval**: `/admin/reader-applicants` creates token.
3) **Token gate**: `/r/[token]` creates session + redirects.
4) **Reading pages**:
   - `/read/partial/[program]` (beta partial).
   - `/read/full/[program]` (ARC/full).
5) **Tracking + survey**:
   - Events via `/api/reader/event`.
   - Survey via `/r/[token]/survey` → `/api/reader/survey`.

## Beta/ARC Data Model (Drizzle)
Implemented tables in `apps/author/db/schema.ts`:
- `reader_applicants`
  - cohort_type, program, email, format_pref, content_notes_ack, taste_profile, source
  - status, approved_at, invite_id, created_at
- `reader_invites`
  - token (unique), cohort_type, program, reading_mode, active, email, created_at
- `reading_sessions`
  - session_id (unique), invite_id, started_at, last_seen_at, completed_at, completion_method
- `reading_events`
  - session_id, event_name, meta, created_at (indexed by session_id)
- `reading_survey_responses`
  - session_id, cohort_type, program, submitted_at, answers, testimonial consent + attribution fields,
    ARC review intent fields

## Sanity Schema Additions
- `manuscriptChapter` (private manuscript content)
  - manuscriptKey, order, chapterLabel, title (optional), content (Portable Text).

## Next.js Routes + APIs (App Router)
Public pages:
- `/start-here`, `/books`, `/books/[slug]`, `/about`, `/newsletter`
- `/beta-readers`, `/arc-readers`

Private routes:
- `/r/[token]` (token gate)
- `/read/partial/[program]`
- `/read/full/[program]`
- `/r/[token]/survey`
- `/admin/reader-applicants`
- `/admin/reader-metrics`
- `/admin/reader-surveys/[id]`

APIs:
- `POST /api/reader/apply`
- `POST /api/admin/reader/approve`
- `POST /api/reader/session`
- `POST /api/reader/event`
- `POST /api/reader/survey`

## Admin Routes
Protected by `ADMIN_TOKEN` in middleware:
- `/admin/reader-applicants` (approve + generate token)
- `/admin/reader-metrics` (completion + drop-off + survey list)
- `/admin/reader-surveys/[id]` (survey detail)

## SEO + Privacy
- All beta/ARC routes must include `noindex, nofollow` and be excluded from sitemap.
- Do not add beta/ARC links to public nav or homepage.

## Design System / UI Constraints
- Reuse `apps/author/components` primitives (button/input/label) and `global.css` tokens.
- Follow the existing layout shell in `apps/author/app/(site)/layout.tsx`.
- No new styling frameworks or resets.

## Implementation Notes (When Ready)
- Subscribe upgrade should reuse `POST /api/subscribe` without breaking behavior.
- Token access should be server-validated before rendering manuscript content.
- Consider server actions or route handlers for admin approval to avoid client secrets.
- Store only necessary PII; avoid leaking emails in client-rendered pages.
