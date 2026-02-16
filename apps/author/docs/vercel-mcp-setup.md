# Vercel MCP Server Setup (Codex)

This guide explains how to connect Codex to Vercel via Vercel's hosted MCP server.

## Add the MCP server

### Option A: Add it from the terminal (Codex CLI)

```bash
codex mcp add vercel --url https://mcp.vercel.com
```

Codex should detect OAuth and open a browser window so you can authorize.

### Option B: Add it via project config (Codex Desktop / project-scoped)

This repo includes a project-scoped Codex config at:

- `.codex/config.toml`

It already declares:

- `mcp_servers.vercel.url = "https://mcp.vercel.com"`

Restart Codex after changes so it reloads MCP server configuration.

## (Recommended) Use a project-specific URL

Vercel supports a project-specific MCP URL, which avoids having to provide team/project parameters to tools:

`https://mcp.vercel.com/<teamSlug>/<projectSlug>`

### What to use in this repo

This Next.js app is linked to a Vercel project named `author` (see `apps/author/.vercel/project.json`).

- `projectSlug`: usually `author`
- `teamSlug`: the team/account slug from the Vercel dashboard URL

Once you know both, replace the `url` in `.codex/config.toml` with the project-specific URL.

