# Author Platform + Beta/ARC Expansion Plan (apps/author)

## Repo Snapshot (apps/author)
- Router: Next.js App Router with route groups in `apps/author/app/(site)` and `apps/author/app/(studio)`.
- Layouts: `apps/author/app/(site)/layout.tsx` wraps header + main, uses `apps/author/app/global.css` tokens.
- Components: `apps/author/components` includes header/nav, button, input, label, and other site-specific primitives.
- Tokens/Theme: CSS custom properties in `apps/author/app/global.css` for spacing, typography (`--fs-*`), palette, and utilities.
- DB (Drizzle + Neon): `apps/author/db/index.ts` and `apps/author/db/schema.ts` define `users` + `subscribers`.
- Subscribe flow: `apps/author/app/api/subscribe/route.ts` writes to `subscribers` table.
- Sanity: schemas in `apps/author/sanity/schemas`, queries in `apps/author/sanity/sanity-utils.ts`.

## Goals (Plan Only)
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

## Beta + ARC Flow (High-Level)
1) **Public signup link** (Instagram bio): `/beta-readers` (public explanation + form)
2) **Manual approval** via admin list:
   - Admin approves applicant and issues a token.
   - Token produces a private link to gated chapters.
3) **Token-gated reading page**:
   - `/beta/[token]` (reads private chapters, must be `noindex, nofollow`)
4) **Tracking**:
   - Track per-chapter progress + completion rate.
   - Capture drop-off chapter when user exits or submits survey.
5) **Survey**:
   - `/beta/[token]/survey` (feedback, testimonial consent, attribution preference)

## Beta/ARC Data Model (Drizzle)
Add new tables in `apps/author/db/schema.ts` (exact names TBD):
- `beta_applicants`
  - id, email, status (pending/approved/rejected), source, format_preference, created_at
- `beta_tokens`
  - id, token (unique), applicant_id (fk), manuscript_id (fk), status (active/expired), created_at, expires_at
- `beta_sessions` (progress tracking)
  - id, token_id (fk), chapter_number, started_at, completed_at
- `beta_surveys`
  - id, token_id (fk), hook_moment, attention_drop, confusion, character_realism,
    keep_reading (enum), stop_point, testimonial_permission, attribution_preference, attribution_name, created_at

Notes:
- Token table should be the single gate for access.
- Surveys should reference token_id for attribution to applicant.
- Sessions can be lightweight (e.g., update on page events or API calls).

## Sanity Schema Additions
- `manuscriptChapter` (private manuscript content)
  - title, slug, chapter_number, book reference, content (portable text), content_notes
  - Use for paste-by-hand chapters rather than public writing.

## Next.js Routes + APIs (App Router)
Public pages:
- `apps/author/app/(site)/start-here/page.tsx`
- `apps/author/app/(site)/books/page.tsx`
- `apps/author/app/(site)/books/[slug]/page.tsx`
- `apps/author/app/(site)/about/page.tsx`
- `apps/author/app/(site)/newsletter/page.tsx` (reuse existing subscribe form)

Beta/ARC:
- `/beta-readers` (public signup)
- `/beta/[token]` (token-gated chapters)
- `/beta/[token]/survey` (feedback)

APIs:
- `POST /api/beta/apply` (create applicant)
- `POST /api/beta/approve` (admin-only; issues token)
- `GET /api/beta/[token]` (validate token + fetch chapters)
- `POST /api/beta/progress` (log progress + completion)
- `POST /api/beta/survey` (store feedback + permissions)

## Admin Routes
Admin-only routes under App Router (auth TBD):
- `/admin/beta-applicants`
  - list applicants, approve/reject, generate token links
- `/admin/beta-metrics`
  - dashboard: completion %, drop-off by chapter, survey list

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
