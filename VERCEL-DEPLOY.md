# Vercel deploy guardrails (portfolio vs author)

This repo contains two separate Next.js apps that must deploy to different domains:

- `apps/portfolio` → `mmhuntsberry.com`
- `apps/author` → `matthewhuntsberry.com`

## Required Vercel setup (one time)

Create (or confirm) two separate Vercel Projects, each with the correct Root Directory.

**Portfolio project**

- Root Directory: `apps/portfolio`
- Uses: `apps/portfolio/vercel.json`

**Author project**

- Root Directory: `apps/author`
- Uses: `apps/author/vercel.json`

Make sure each domain is attached to the correct project and not shared between both.

## Deploying locally (Vercel CLI)

Link each app directory once, then deploy from that same directory.

```bash
cd apps/portfolio && vercel link
cd apps/author && vercel link
```

Deploy:

```bash
npm run deploy:portfolio
npm run deploy:author
```

## Why this exists

Avoids “mixed up” deployments caused by deploying from the repo root or by Vercel projects that are both pointed at the monorepo root.

