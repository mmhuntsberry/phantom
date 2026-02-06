# Substack MCP Server Setup

This guide explains how to set up Substack's Model Context Protocol (MCP) server to enable AI assistants (like Cursor) to interact with your Substack newsletter.

## What is MCP?

The MCP server allows AI assistants to:
- Retrieve newsletter posts and content
- Get post metadata (title, author, subtitle, etc.)
- Search posts within newsletters
- Create and manage drafts
- Schedule posts
- Access user profile information and subscriptions

## Prerequisites

- Substack account with API access
- Node.js v18 or higher (for npm-based servers)
- An MCP-compatible AI client (Cursor, Codex, Claude Desktop, VS Code with MCP extension, etc.)

## Option 1: substack-mcp-plus (Recommended)

This is a feature-rich unofficial Substack MCP server with 12 tools, browser authentication, and rich text support.

### Setup Steps:

1. **Open Cursor Settings**
   - Press `Cmd/Ctrl + ,` to open settings
   - Navigate to **Features** → **MCP** (or search for "MCP")
   - Click **Add MCP Server** or edit your existing MCP configuration

2. **Add Substack MCP Server Configuration**

   Add the following to your MCP servers configuration:

   ```json
   {
     "mcpServers": {
       "substack": {
         "command": "npx",
         "args": ["-y", "substack-mcp-plus@latest"]
       }
     }
   }
   ```

   If you already have other MCP servers (like Sanity), merge them together:

   ```json
   {
     "mcpServers": {
       "sanity": {
         "url": "https://mcp.sanity.io",
         "type": "http"
       },
       "substack": {
         "command": "npx",
         "args": ["-y", "substack-mcp-plus@latest"]
       }
     }
   }
   ```

3. **Save and Restart**

   - Save the configuration
   - Restart Cursor to apply changes

4. **First-time Authentication**

   When you first use the MCP server, it will prompt you to authenticate via browser. Follow the prompts to authorize access to your Substack account.

## Option 2: substack-mcp (Official)

A simpler official Substack MCP server.

### Setup Steps:

1. **Open Cursor Settings**
   - Press `Cmd/Ctrl + ,` to open settings
   - Navigate to **Features** → **MCP**
   - Click **Add MCP Server**

2. **Add Configuration**

   ```json
   {
     "mcpServers": {
       "substack": {
         "command": "npx",
         "args": ["-y", "substack-mcp@latest"]
       }
     }
   }
   ```

3. **Environment Variables (if needed)**

   Some servers may require environment variables. If needed, you can add them:

   ```json
   {
     "mcpServers": {
       "substack": {
         "command": "npx",
         "args": ["-y", "substack-mcp@latest"],
         "env": {
           "SUBSTACK_API_KEY": "${SUBSTACK_API_KEY}"
         }
       }
     }
   }
   ```

   Then set the environment variable in your shell or Cursor settings:
   ```bash
   export SUBSTACK_API_KEY="your-api-key-here"
   ```

## Alternative: Manual Configuration File

If you prefer to configure via a file, you can create `.cursor/mcp.json` in your project root (though Cursor typically uses settings UI):

```json
{
  "mcpServers": {
    "sanity": {
      "url": "https://mcp.sanity.io",
      "type": "http"
    },
    "substack": {
      "command": "npx",
      "args": ["-y", "substack-mcp-plus@latest"]
    }
  }
}
```

## Setting Up with Codex

Codex reads MCP server configuration from `~/.codex/config.toml` (macOS/Linux).

### Configure Codex

1. **Open your Codex config**

   Edit `~/.codex/config.toml`.

2. **Add a Substack MCP server**

   Add a new section like this:

   ```toml
   [mcp_servers.substack]
   command = "npx"
   args = ["-y", "substack-mcp-plus@latest"]
   enabled = true
   ```

   If you prefer the official package, use:

   ```toml
   [mcp_servers.substack]
   command = "npx"
   args = ["-y", "substack-mcp@latest"]
   enabled = true
   ```

3. **Restart Codex**

   Restart the application to load the new MCP server configuration.

4. **Authenticate**

   When you first use the Substack MCP server, it will prompt you to authenticate via browser.

## Verifying Setup

Once configured, you can test the MCP server by asking your AI assistant:

- "What Substack newsletters do I have access to?"
- "Retrieve the latest post from my Substack"
- "Search for posts about [topic] in my Substack"
- "Create a draft post with title [title]"

## Troubleshooting

### MCP Server Not Connecting

1. **Check Node.js version**: Ensure you have Node.js v18 or higher
   ```bash
   node --version
   ```

2. **Verify npx is available**: Make sure npx is installed
   ```bash
   which npx
   ```

3. **Check authentication**: Make sure you've completed the browser authentication flow (for substack-mcp-plus)

4. **Restart Codex**: Sometimes a restart is needed after configuration changes

5. **Check your Codex config**:
   - Confirm the `[mcp_servers.substack]` section exists in `~/.codex/config.toml`
   - Confirm `enabled = true`
   - Confirm `npx` is on your `PATH`

### Authentication Issues

- For `substack-mcp-plus`: The server uses browser-based authentication. Make sure to complete the OAuth flow when prompted.
- For `substack-mcp`: Check if API keys are required and properly set in environment variables.

### Permission Errors

- Ensure your Substack account has the necessary permissions
- Verify that you're authenticated with the correct Substack account
- Check that the MCP server has access to the newsletters you're trying to access

### Server Not Found

If you get errors about the package not being found:
- Make sure you have internet connectivity
- Try running `npx substack-mcp-plus@latest` manually in terminal to verify it works
- Check npm registry access

## Features Comparison

### substack-mcp-plus
- ✅ 12 tools
- ✅ Browser authentication
- ✅ Rich text support
- ✅ Create and manage drafts
- ✅ Schedule posts
- ✅ More comprehensive feature set

### substack-mcp
- ✅ Official package
- ✅ Simpler setup
- ✅ Basic post retrieval
- ✅ Search functionality

## Resources

- [substack-mcp-plus npm](https://www.npmjs.com/package/substack-mcp-plus)
- [substack-mcp npm](https://www.npmjs.com/package/substack-mcp)
- [MCP Protocol Spec](https://modelcontextprotocol.io/)
- [Substack API Documentation](https://substack.com/api-docs)
