# Shopify Dev MCP Server HTTP Gateway

This API route exposes the Shopify Dev MCP server as an HTTP REST endpoint, allowing you to use MCP tools over HTTP instead of stdio.

## Endpoint

- **URL**: `/api/mcp/shopify`
- **Method**: `POST` (for MCP requests) or `GET` (for health check)
- **Content-Type**: `application/json`

## Usage

### Health Check

```bash
curl https://your-app.vercel.app/api/mcp/shopify
```

### Example: List Available Tools

```bash
curl -X POST https://your-app.vercel.app/api/mcp/shopify \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/list",
    "params": {}
  }'
```

### Example: Search Documentation

```bash
curl -X POST https://your-app.vercel.app/api/mcp/shopify \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "2",
    "method": "tools/call",
    "params": {
      "name": "search_docs_chunks",
      "arguments": {
        "query": "How do I create a product using the Admin API?"
      }
    }
  }'
```

### Example: Introspect GraphQL Schema

```bash
curl -X POST https://your-app.vercel.app/api/mcp/shopify \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "3",
    "method": "tools/call",
    "params": {
      "name": "introspect_graphql_schema",
      "arguments": {
        "api": "admin",
        "query": "Product"
      }
    }
  }'
```

### Example: Validate GraphQL Code

```bash
curl -X POST https://your-app.vercel.app/api/mcp/shopify \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "4",
    "method": "tools/call",
    "params": {
      "name": "validate_graphql_codeblocks",
      "arguments": {
        "api": "admin",
        "codeblocks": [
          {
            "code": "query { products(first: 10) { edges { node { id title } } } }",
            "language": "graphql"
          }
        ]
      }
    }
  }'
```

## Request Format

All requests must follow the JSON-RPC 2.0 specification:

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "method-name",
  "params": {}
}
```

### Common MCP Methods

1. **`tools/list`** - List all available MCP tools
2. **`tools/call`** - Call a specific tool with arguments
3. **`initialize`** - Initialize the MCP server (optional)

## Response Format

Responses follow JSON-RPC 2.0 format:

### Success Response

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    // Tool-specific result data
  }
}
```

### Error Response

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": "Error details"
  }
}
```

## Available MCP Tools

The Shopify Dev MCP server provides these tools:

1. **`learn_shopify_api`** - Get context about Shopify APIs
2. **`search_docs_chunks`** - Search Shopify documentation
3. **`fetch_full_docs`** - Get complete documentation for a path
4. **`introspect_graphql_schema`** - Explore GraphQL schemas
5. **`validate_graphql_codeblocks`** - Validate GraphQL code
6. **`validate_component_codeblocks`** - Validate component code
7. **`validate_theme_codeblocks`** - Validate Liquid codeblocks
8. **`validate_theme`** - Validate entire theme directories

## Environment Variables

- **`MCP_TIMEOUT_MS`** (optional): Timeout in milliseconds for MCP requests (default: 10000ms / 10 seconds)
  - Vercel Hobby: 10 seconds max
  - Vercel Pro: 60 seconds max
  - Vercel Enterprise: 300 seconds max

## Vercel Serverless Environment

The endpoint is optimized for Vercel's serverless functions:

- **Writable Directory**: Automatically uses `/tmp` (the only writable directory in Vercel)
- **npm Configuration**: All npm/npx cache and temp directories are set to `/tmp`
- **Working Directory**: Process runs from `/tmp` to avoid permission issues
- **Cross-Platform**: Works in both Vercel (Linux) and local development (Windows/Unix)

The code automatically:
- Creates necessary temp directories (`.npm`, `.npm-tmp`, `.npx`)
- Configures npm environment variables to use writable locations
- Sets the working directory to `/tmp` for the subprocess
- Handles both Vercel serverless and local development environments

## Limitations

1. **Cold Starts**: Each request spawns a new MCP server process, which may add latency
2. **Timeout**: Default 10-second timeout (adjustable via `MCP_TIMEOUT_MS`)
3. **Concurrency**: Vercel serverless functions have concurrency limits
4. **Process Spawning**: Requires `npx` to be available in the Vercel environment

## Error Handling

The API returns appropriate HTTP status codes:

- **200**: Success
- **400**: Invalid request or MCP error
- **405**: Method not allowed (only POST is allowed for requests)
- **500**: Internal server error

## Example JavaScript Client

```javascript
async function callMCPTool(toolName, arguments) {
  const response = await fetch('/api/mcp/shopify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `req_${Date.now()}`,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: arguments,
      },
    }),
  });

  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error.message);
  }
  
  return result.result;
}

// Usage
const docs = await callMCPTool('search_docs_chunks', {
  query: 'How to create a product?',
});
```

## Notes

- The MCP server is spawned fresh for each request (stateless)
- Instrumentation is disabled by default (`OPT_OUT_INSTRUMENTATION=true`)
- Stderr output is logged in development mode only
- The endpoint is unauthenticated - add authentication if needed for production
