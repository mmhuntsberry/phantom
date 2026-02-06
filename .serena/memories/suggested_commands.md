# Suggested Commands
- Run author app (dev): `npx nx serve author --dev` or `npm run dev:author`
- Run portfolio app (dev): `npm run dev:portfolio`
- Storybook: `npm run storybook`
- Author e2e tests: `npm run author:test:e2e` (requires `apps/author/.env.local`)
- Author e2e tests with server: `npm run author:test:e2e:serve`
- DB migrations (author): `npm run author:db:migrate`
- Drizzle generate/push: `npm run author:db:generate`, `npm run author:db:push`
- DB constraints utilities: `npm run author:db:ensure-index`, `npm run author:db:fix-constraints`, `npm run author:db:reset-constraints`
