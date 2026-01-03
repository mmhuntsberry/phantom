# Neon DB Setup (Author App)

## Environment Variables
- Local: create `apps/author/.env.local` and set `DATABASE_URL=...`.
- CI: set `DATABASE_URL` in your CI environment (no file required).
- Admin approvals: set `ADMIN_TOKEN` in `apps/author/.env.local` and CI to lock the `/admin/reader-applicants` approve action.

Example:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require
ADMIN_TOKEN=admin-<random>
```

Notes:
- `apps/author/.env.local` must include `DATABASE_URL` (the `apps/author/.env` file is not loaded by the scripts).
- Optional: set `DATABASE_HOST_IP` only if your DNS resolution fails locally.

## Drizzle Migrations
From repo root:
- Generate migrations:
  - `npm run author:db:generate`
- Apply migrations:
  - `npm run author:db:migrate`

Notes:
- Both scripts load `apps/author/.env.local` using `dotenv-cli` for local use.
- CI should set `DATABASE_URL` directly and can run the same scripts.

## Neon SSL Reliability
When running locally (non-Vercel), the Postgres pool auto-enables SSL if:
- the host contains `neon.tech`, or
- the URL includes `sslmode=require`

This avoids TLS errors while keeping local Postgres (no SSL) working.

## Verifying Tables in Neon
1) Open your Neon project.
2) Go to the SQL editor.
3) Run:
```
\dt
```
4) Confirm tables (e.g., `users`, `subscribers`, and any new tables).

## Common Errors + Fixes
- `Missing DATABASE_URL`:
  - Add `DATABASE_URL` to `apps/author/.env.local` (local) or CI secrets.
- `ENOTFOUND` / DNS failures (Neon host not resolving):
  - Retry the migration; or temporarily set `DATABASE_HOST_IP` to a resolved Neon IP.
- `self signed certificate` / TLS errors:
  - Ensure your `DATABASE_URL` includes `sslmode=require` or uses a `neon.tech` host.
- `relation does not exist` after deploy:
  - Run `npm run author:db:migrate` against the target database.
- `permission denied for schema public`:
  - Use the correct Neon connection string with a role that has DDL permissions.
