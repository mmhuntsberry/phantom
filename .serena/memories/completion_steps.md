# Completion Steps
- For beta/ARC flow changes, use `apps/author/docs/smoke-test.md` checklist.
- Ensure `apps/author/.env.local` has `DATABASE_URL` and `ADMIN_TOKEN`.
- Run DB migrations for author app: `npm run author:db:migrate`.
- Run e2e if needed: `npm run author:test:e2e`.
