# MCP Toolset Server

Exposes Anthropic's `mcpToolset_20251120` functionality as an MCP server, allowing Cursor AI and other MCP clients to use Claude with external MCP tool access.

## Installation

```bash
cd mcp-servers/mcp-toolset-server
npm install
npm run build
```

## Configuration

### Add to Cursor's mcp.json

```json
{
  "mcpServers": {
    "mcp-toolset": {
      "command": "node",
      "args": ["C:/Users/MLPC/.cursor/N.I.G.E.L/mcp-servers/mcp-toolset-server/dist/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_anthropic_api_key",
        "MCP_SERVER_CONFIGS": "[{\"type\":\"url\",\"url\":\"https://api.example.com/sse\",\"name\":\"example\",\"authorization_token\":\"your_token\",\"allowlist\":[\"search\",\"read\"],\"deferLoading\":true}]"
      }
    }
  }
}
```

### Environment Variables

- `ANTHROPIC_API_KEY` - Your Anthropic API key (required)
- `MCP_SERVER_CONFIGS` - JSON array of MCP server configurations

### MCP Server Config Format

```json
[
  {
    "type": "url",
    "url": "https://api.example.com/sse",
    "name": "example",
    "authorization_token": "optional_token",
    "allowlist": ["tool1", "tool2"],
    "deferLoading": true
  }
]
```

## Available Tools

### 1. query_with_mcp_tools

Query Claude with access to configured MCP server tools.

**Parameters:**
- `query` (required) - Natural language question/instruction
- `servers` (optional) - Array of specific server names to use

**Example:**
```
Query: "Search for recent AI papers on arxiv"
Servers: ["arxiv-mcp"]
```

### 2. list_mcp_servers

List all configured MCP servers.

**Returns:**
- Number of configured servers
- Server names, URLs, and auth status

## Usage in Cursor

Once configured in `mcp.json`, you can ask Cursor AI:

```
"Use the mcp-toolset to search for recent AI papers"
```

Cursor AI will then use the `query_with_mcp_tools` tool, which connects to your configured MCP servers via Claude.

## Example Configurations

### Web Search (Perplexity)

```json
{
  "type": "url",
  "url": "https://api.perplexity.ai/mcp/sse",
  "name": "perplexity",
  "authorization_token": "your_perplexity_key",
  "allowlist": ["search"],
  "deferLoading": true
}
```

### Calendar

```json
{
  "type": "url",
  "url": "https://calendar.example.com/sse",
  "name": "calendar",
  "authorization_token": "your_calendar_token",
  "allowlist": ["search_events", "create_event"],
  "deferLoading": true
}
```

### Research Papers

```json
{
  "type": "url",
  "url": "https://papers.example.com/sse",
  "name": "research",
  "authorization_token": "your_research_token",
  "allowlist": ["search_papers", "get_abstract"],
  "deferLoading": true
}
```

## Cost Optimization

- Use `allowlist` to only load specific tools (60-80% savings)
- Enable `deferLoading` for large servers (tools loaded on-demand)
- Claude Haiku will be automatically used when appropriate

## Troubleshooting

### Server not appearing in Cursor

1. Check `mcp.json` syntax is valid
2. Restart Cursor
3. Check Cursor logs for errors

### Query errors

1. Verify `ANTHROPIC_API_KEY` is set
2. Verify `MCP_SERVER_CONFIGS` JSON is valid
3. Check MCP server URLs are accessible

## License

MIT
