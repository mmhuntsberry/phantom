# Neon Branch Setup for Dev/Prod Environments

This guide explains how to use different Neon database branches for development and production environments.

## Branch Strategy

- **`main` branch** → Development, Preview, and Local environments
- **`production` branch** → Production environment only

## Setup Steps

### 1. Get Connection Strings from Neon

1. Open your Neon project in the console
2. For each branch, copy the connection string:
   - Switch to "main" branch → Copy connection string
   - Switch to "production" branch → Copy connection string

### 2. Configure Vercel Environment Variables

#### Via Vercel Dashboard:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL` and click **Edit**
3. Set different values for each environment:
   - **Production**: Paste the "production" branch connection string
   - **Preview**: Paste the "main" branch connection string  
   - **Development**: Paste the "main" branch connection string
4. Save

#### Via Vercel CLI:

```bash
# Set production database (production branch)
vercel env add DATABASE_URL production
# Paste the "production" branch connection string when prompted

# Set preview/development database (main branch)
vercel env add DATABASE_URL preview
# Paste the "main" branch connection string when prompted

vercel env add DATABASE_URL development
# Paste the "main" branch connection string when prompted
```

### 3. Local Development

For local development, use the "main" branch connection string in `apps/author/.env.local`:

```bash
DATABASE_URL="postgresql://user:pass@main-branch-host.neon.tech/db?sslmode=require"
```

## Migration Workflow

### When you create new migrations:

1. **Test migrations on `main` branch first:**
   ```bash
   # Set DATABASE_URL to main branch in .env.local
   npm run author:db:migrate
   ```

2. **After testing, apply to `production` branch:**
   - Option A: Use Neon SQL Editor on "production" branch
     - Copy `apps/author/scripts/all-migrations.sql`
     - Run in Neon SQL Editor for "production" branch
   
   - Option B: Use Vercel migration endpoint
     - Temporarily set Vercel Production `DATABASE_URL` to production branch
     - Call `/api/admin/migrate` endpoint
     - Restore original `DATABASE_URL` if needed

### Keeping branches in sync:

- Always run migrations on `main` first (dev/preview)
- Test thoroughly on `main` branch
- Then apply same migrations to `production` branch
- Use `apps/author/scripts/all-migrations.sql` for idempotent migrations

## Benefits

✅ **Isolated environments**: Dev changes don't affect production data  
✅ **Safe testing**: Test migrations on dev branch before production  
✅ **Easy rollback**: Reset dev branch without affecting production  
✅ **Data protection**: Production data stays separate from dev experiments

## Troubleshooting

**"Table doesn't exist" errors:**
- Check which branch your `DATABASE_URL` points to
- Run migrations on that branch using Neon SQL Editor or migration script

**Schema drift between branches:**
- Compare schemas in Neon console
- Run `all-migrations.sql` on the branch that's missing tables/columns

**Wrong branch in production:**
- Check Vercel environment variables
- Verify `DATABASE_URL` in Production environment points to "production" branch
