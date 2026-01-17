# Sanity MCP Server Setup

This guide explains how to set up Sanity's Model Context Protocol (MCP) server to enable AI assistants (like Cursor) to interact with your Sanity CMS.

## What is MCP?

The MCP server allows AI assistants to:
- Query your Sanity content using GROQ
- Read and understand your schema
- Create, update, and publish documents
- Manage releases and versions

## Prerequisites

- Sanity project ID: `rkn5h0ji`
- Dataset: `production`
- Sanity account with API access

## Option 1: Remote Hosted Server (Recommended)

The easiest way is to use Sanity's hosted MCP server at `https://mcp.sanity.io`.

### For Cursor:

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to **Features** → **MCP** (or search for "MCP")
3. Click **Add MCP Server** or edit your MCP configuration
4. Add the following configuration:

```json
{
  "mcpServers": {
    "sanity": {
      "url": "https://mcp.sanity.io",
      "type": "http"
    }
  }
}
```

5. Save the configuration
6. Cursor will prompt you to authenticate via OAuth - follow the prompts to authorize

### For VS Code:

1. Install the MCP extension (if not already installed)
2. Open Command Palette (Cmd/Ctrl + Shift + P)
3. Run: **"MCP: Open User Configuration"**
4. Add the server configuration as above
5. Authenticate when prompted

## Option 2: Local/Self-Hosted Server

If you prefer to run the server locally (deprecated but still works):

### 1. Deploy Schema Manifest

First, deploy your schema to Sanity's schema store:

```bash
cd apps/author
SANITY_CLI_SCHEMA_STORE_ENABLED=true npx sanity schema deploy
```

### 2. Get API Token

1. Go to https://sanity.io/manage
2. Select your project (`rkn5h0ji`)
3. Go to **API** → **Tokens**
4. Create a new token with **Developer** role (or **Editor** for limited permissions)
5. Copy the token

### 3. Configure MCP Client

For Cursor, create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server@latest"],
      "env": {
        "SANITY_PROJECT_ID": "rkn5h0ji",
        "SANITY_DATASET": "production",
        "SANITY_API_TOKEN": "your-api-token-here",
        "MCP_USER_ROLE": "developer"
      }
    }
  }
}
```

**⚠️ Security Note:** Never commit your API token to git! Use environment variables or Cursor's secure storage.

### 4. Alternative: Use Environment Variables

Instead of hardcoding the token, you can use environment variables:

1. Create `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "sanity": {
      "command": "npx",
      "args": ["-y", "@sanity/mcp-server@latest"],
      "env": {
        "SANITY_PROJECT_ID": "rkn5h0ji",
        "SANITY_DATASET": "production",
        "SANITY_API_TOKEN": "${SANITY_API_TOKEN}",
        "MCP_USER_ROLE": "developer"
      }
    }
  }
}
```

2. Set the environment variable in your shell or Cursor settings:
```bash
export SANITY_API_TOKEN="your-token-here"
```

## Verifying Setup

Once configured, you can test the MCP server by asking your AI assistant:

- "What schemas are available in my Sanity project?"
- "Query all books from Sanity"
- "Show me the structure of the book schema"

## Troubleshooting

### MCP Server Not Connecting

1. **Check authentication**: Make sure you've completed OAuth flow (for remote) or have valid API token (for local)
2. **Verify project ID**: Ensure `rkn5h0ji` is correct
3. **Check dataset name**: Should be `production`
4. **Restart Cursor/VS Code**: Sometimes a restart is needed after configuration changes

### Schema Not Found

If the AI can't see your schemas:
1. Deploy schema manifest: `SANITY_CLI_SCHEMA_STORE_ENABLED=true npx sanity schema deploy`
2. Wait a few minutes for propagation
3. Restart the MCP server

### Permission Errors

- Ensure your API token has the correct role (`developer` for full access, `editor` for content-only)
- Check that the token hasn't expired
- Verify the token has access to the `production` dataset

## Recommended: Use Remote Server

The remote hosted server (`https://mcp.sanity.io`) is recommended because:
- ✅ No local setup required
- ✅ Auto-updates with new features
- ✅ More secure (OAuth instead of tokens)
- ✅ Better performance
- ✅ Actively maintained

The local server is deprecated and won't receive new features.

## Resources

- [Sanity MCP Documentation](https://www.sanity.io/docs/compute-and-ai/mcp-server)
- [Sanity MCP GitHub](https://github.com/sanity-io/sanity-mcp-server)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
