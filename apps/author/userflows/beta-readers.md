# Beta Readers User Flow (Current)

This flow reflects the current beta reader experience from public signup through admin review.

## 1) Public apply
- Reader visits `"/beta-readers"` (beta cohort, partial program).
- Submits the application form (includes format preference + content notes ack).
- `POST /api/reader/apply` creates a `reader_applicants` row with `status = 'pending'`.

## 2) Admin approval
- Admin visits `"/admin/reader-applicants?admin=<ADMIN_TOKEN>"` (protected by admin token).
- Clicks "Approve + generate".
- `POST /api/admin/reader/approve` creates a `reader_invites` row with a unique token and links it to the applicant.

## 3) Token gate
- Reader receives the invite link `"/r/<token>"`.
- Token is validated; a `reading_sessions` row is created via `/api/reader/session`.
- Reader is redirected to `"/read/partial/<program>"` (beta reading page).

## 4) Reading + tracking
- Reader reads chapters in the partial program.
- `POST /api/reader/event` logs reading events (page/chapter views).
- "Finish reading" sets completion data in `reading_sessions` with `completion_method = 'end_reached'`.

## 5) Survey
- Reader clicks "Take the 2-minute survey" → `"/r/<token>/survey"`.
- `POST /api/reader/survey` stores responses in `reading_survey_responses`.
- Completion method is set to `survey_submitted`.

## 6) Admin review
- Admin checks `"/admin/reader-metrics?admin=<ADMIN_TOKEN>"` for completion and drop-off.
- Clicks a survey entry to view detail at `"/admin/reader-surveys/<id>"`.

## Notes
- Beta/ARC pages are `noindex, nofollow` and hidden from public nav.
- ARC readers follow the same flow via `"/arc-readers"` and `"/read/full/<program>"`.
