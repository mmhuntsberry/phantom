# Author Platform Smoke Test Checklist

Use this checklist for manual verification after changes or deployments.

## Status
- Playwright E2E covers:
  - Full apply → approve → read → survey → admin review.
  - Approved reader → read → survey → admin review.
- CI wiring is optional and not yet added.

## Resume Checklist
- [ ] Add Playwright CI job (optional).
- [ ] Add Drizzle `0002_snapshot.json` meta (optional cleanup).
- [ ] Consider adding optional applicant name field (DB + form + admin list).

## Pre-flight
- [ ] `apps/author/.env.local` includes `DATABASE_URL` and `ADMIN_TOKEN`.
- [ ] DB migrations are applied: `npm run author:db:migrate`.
- [ ] Author app is running: `npx nx serve author`.

## 1) Public apply pages
### Beta
- [ ] Open `http://localhost:4200/beta-readers`.
- [ ] Submit the form with a real email.
- [ ] Success message: "If selected, you'll receive a private access link."

### ARC
- [ ] Open `http://localhost:4200/arc-readers`.
- [ ] Submit the form with a real email.
- [ ] Success message: "If selected, you'll receive a private access link."

### DB verification
- [ ] Run in Neon SQL editor:
```
select email, cohort_type, program, status, created_at
from reader_applicants
order by created_at desc
limit 5;
```
- [ ] Verify new rows exist with `status = 'pending'`.

## 2) Admin approval flow
- [ ] Open `http://localhost:4200/admin/reader-applicants?admin=<ADMIN_TOKEN>`.
- [ ] Click "Approve + generate" for a pending applicant.
- [ ] Status changes to "approved" and `/r/<token>` appears.

### DB verification
- [ ] Run:
```
select token, cohort_type, program, reading_mode, active, created_at
from reader_invites
order by created_at desc
limit 5;
```
- [ ] Run:
```
select status, approved_at, invite_id
from reader_applicants
order by approved_at desc
limit 5;
```

## 3) Token gate + redirect
- [ ] Open `/r/<token>` from the admin approval UI.
- [ ] Page redirects to `/read/partial/<program>` or `/read/full/<program>`.

## 4) Reader page + tracking
- [ ] Confirm chapters render and look correct.
- [ ] Scroll through the chapter list.
- [ ] Click "Finish reading".

### DB verification
- [ ] Run:
```
select session_id, invite_id, started_at, last_seen_at, completed_at, completion_method
from reading_sessions
order by started_at desc
limit 5;
```
- [ ] Run:
```
select session_id, event_name, meta, created_at
from reading_events
order by created_at desc
limit 10;
```
- [ ] Expect `page_view`, `chapter_view`, and `chapter_end` events.

## 5) Survey flow
- [ ] From the reader page, click "Take the 2-minute survey".
- [ ] Submit the form.

### DB verification
- [ ] Run:
```
select cohort_type, program, submitted_at, testimonial_consent
from reading_survey_responses
order by submitted_at desc
limit 5;
```
- [ ] Confirm `reading_sessions.completion_method = 'survey_submitted'`:
```
select session_id, completion_method, completed_at
from reading_sessions
order by completed_at desc
limit 5;
```

## 6) Admin metrics + survey details
- [ ] Open `http://localhost:4200/admin/reader-metrics?admin=<ADMIN_TOKEN>`.
- [ ] Verify completion rate and drop-off list render.
- [ ] Click a survey entry.
- [ ] Verify detail view at `/admin/reader-surveys/<id>`.

---

# Automation Options (Next Step)

If you want to automate this, there are two good paths:

## Option A — Playwright E2E (recommended)
- Playwright tests are now in `apps/author/tests/e2e/reader-flow.spec.ts`.
- One-time install (downloads browsers): `npx playwright install`.
- Start the app in a separate terminal: `npx nx serve author --dev`.
- Run with local env: `npm run author:test:e2e`.
- To let Playwright start the server (less reliable on some shells): `npm run author:test:e2e:serve`.
- Prereqs:
  - `ADMIN_TOKEN` must be set in `apps/author/.env.local`.
  - Manuscript chapters must exist in Sanity if you want to assert reading page content.
  - Set `E2E_REQUIRE_MANUSCRIPT=1` to enforce that check.
- Recommended: point tests at a dedicated test DB/Neon branch to keep data isolated.

## Option B — API-level smoke tests
- Use a small script to hit the APIs (`/api/reader/apply`, `/api/admin/reader/approve`, `/api/reader/session`, `/api/reader/survey`).
- Pros: faster and simpler, but no UI coverage.

If you want, I can scaffold Playwright with a test plan and wire it to a test database branch.
