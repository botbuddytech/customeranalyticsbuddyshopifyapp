/**
 * API Route for Shopify Dev MCP Server
 * 
 * Exposes the Shopify Dev MCP server as an HTTP REST endpoint.
 * Accepts MCP requests over HTTP and forwards them to @shopify/dev-mcp via npx.
 * 
 * Vercel Serverless Optimizations:
 * - Uses /tmp as the working directory (only writable location in Vercel)
 * - Configures npm/npx to use /tmp for cache and temp files
 * - Sets all npm environment variables to writable temp locations
 * - Handles both Vercel (Linux) and local development (Windows/Unix) environments
 */

import type { ActionFunctionArgs } from "react-router";
import { spawn } from "child_process";
import { mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

interface MCPRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id?: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * Gets a writable temporary directory for the MCP server
 * In Vercel serverless, we use /tmp (the only writable directory)
 * In local dev, we use OS temp directory
 */
function getWritableTempDir(): string {
  // Vercel serverless functions run on Linux and only /tmp is writable
  // For local development, use OS temp directory
  const isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV;
  
  if (isVercel || process.platform !== "win32") {
    // Use /tmp for Vercel and Unix-like systems
    return "/tmp";
  } else {
    // Windows: use OS temp directory
    return tmpdir();
  }
}

/**
 * Creates necessary temp directories for npm and npx
 */
function setupTempDirectories(baseTempDir: string): {
  npmCache: string;
  npmTmp: string;
  npxCache: string;
} {
  const npmCache = join(baseTempDir, ".npm");
  const npmTmp = join(baseTempDir, ".npm-tmp");
  const npxCache = join(baseTempDir, ".npx");

  // Create directories if they don't exist
  // This is important for Vercel where /tmp might not have subdirectories
  try {
    mkdirSync(npmCache, { recursive: true });
    mkdirSync(npmTmp, { recursive: true });
    mkdirSync(npxCache, { recursive: true });
  } catch (error: any) {
    // If mkdir fails, log but continue - spawn might still work
    // In Vercel, /tmp should always be writable, so this is unexpected
    console.warn(
      `[MCP] Failed to create temp directories in ${baseTempDir}: ${error.message}. ` +
      `This may cause npm/npx to fail. Check write permissions.`
    );
  }

  return { npmCache, npmTmp, npxCache };
}

/**
 * Spawns the Shopify Dev MCP server and sends a request
 */
async function callMCPServer(request: MCPRequest): Promise<MCPResponse> {
  return new Promise((resolve, reject) => {
    // Get writable temp directory
    const tempDir = getWritableTempDir();
    const { npmCache, npmTmp, npxCache } = setupTempDirectories(tempDir);

    // Spawn the MCP server via npx
    // Use cmd /c on Windows, otherwise use sh -c
    const isWindows = process.platform === "win32";
    const command = isWindows ? "cmd" : "sh";
    const args = isWindows
      ? ["/c", "npx", "-y", "@shopify/dev-mcp@latest"]
      : ["-c", "npx -y @shopify/dev-mcp@latest"];

    // Configure environment for Vercel serverless
    const env = {
      ...process.env,
      // Disable instrumentation for cleaner output
      OPT_OUT_INSTRUMENTATION: "true",
      // Set npm cache directory to writable temp location
      npm_config_cache: npmCache,
      NPM_CONFIG_CACHE: npmCache,
      // Set npm tmp directory
      npm_config_tmp: npmTmp,
      NPM_CONFIG_TMP: npmTmp,
      // Set npx cache directory
      NPX_CACHE_DIR: npxCache,
      // Ensure npm doesn't try to write to read-only locations
      npm_config_prefix: tempDir,
      NPM_CONFIG_PREFIX: tempDir,
      // Disable npm update checks and other write operations outside temp
      npm_config_update_notifier: "false",
      npm_config_audit: "false",
      // Set HOME to temp directory to avoid permission issues
      // (some tools check HOME for config files)
      HOME: tempDir,
      // For Vercel specifically, ensure we're using temp
      ...(process.env.VERCEL && {
        TMPDIR: tempDir,
        TMP: tempDir,
        TEMP: tempDir,
      }),
    };

    const mcpProcess = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: tempDir, // Set working directory to writable temp location
      env,
    });

    let stdout = "";
    let stderr = "";
    let responseReceived = false;

    // Set a timeout (10 seconds for Vercel hobby plan, adjust for pro)
    // Vercel hobby: 10s, Pro: 60s, Enterprise: 300s
    const timeoutMs = parseInt(process.env.MCP_TIMEOUT_MS || "10000", 10);
    const timeout = setTimeout(() => {
      if (!responseReceived) {
        responseReceived = true;
        mcpProcess.kill();
        reject(
          new Error(
            `MCP server request timeout after ${timeoutMs}ms. Increase MCP_TIMEOUT_MS env var for longer operations.`
          )
        );
      }
    }, timeoutMs);

    // Collect stdout data
    mcpProcess.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
      
      // Try to parse JSON responses (MCP uses newline-delimited JSON)
      const lines = stdout.split("\n").filter((line) => line.trim());
      
      for (const line of lines) {
        try {
          const response: MCPResponse = JSON.parse(line);
          
          // Check if this is a response to our request
          if (response.id === request.id || (!request.id && response.id)) {
            if (!responseReceived) {
              responseReceived = true;
              clearTimeout(timeout);
              mcpProcess.kill();
              resolve(response);
              return;
            }
          }
        } catch (e) {
          // Not valid JSON yet, continue collecting
        }
      }
    });

    // Collect stderr for debugging
    mcpProcess.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
      // Log stderr for debugging (especially important in serverless)
      // Check for common errors like ENOENT, permission errors, etc.
      const stderrText = data.toString();
      if (
        stderrText.includes("ENOENT") ||
        stderrText.includes("EACCES") ||
        stderrText.includes("permission denied") ||
        stderrText.includes("cannot find")
      ) {
        console.error("[MCP stderr - potential error]:", stderrText);
      } else if (process.env.NODE_ENV === "development") {
        console.warn("[MCP stderr]:", stderrText);
      }
    });

    // Handle process errors
    mcpProcess.on("error", (error) => {
      if (!responseReceived) {
        responseReceived = true;
        clearTimeout(timeout);
        reject(new Error(`Failed to spawn MCP server: ${error.message}`));
      }
    });

    mcpProcess.on("exit", (code, signal) => {
      if (!responseReceived) {
        responseReceived = true;
        clearTimeout(timeout);
        
        if (code !== 0 && code !== null) {
          reject(
            new Error(
              `MCP server exited with code ${code}. Stderr: ${stderr || "No error output"}`
            )
          );
        } else if (signal) {
          reject(new Error(`MCP server was killed with signal ${signal}`));
        } else if (stdout) {
          // Try to parse the last line as a response
          try {
            const lines = stdout.split("\n").filter((line) => line.trim());
            const lastLine = lines[lines.length - 1];
            if (lastLine) {
              const response: MCPResponse = JSON.parse(lastLine);
              resolve(response);
            } else {
              reject(new Error("No response received from MCP server"));
            }
          } catch (e) {
            reject(
              new Error(
                `Failed to parse MCP response. Output: ${stdout.substring(0, 500)}`
              )
            );
          }
        } else {
          reject(new Error("No output received from MCP server"));
        }
      }
    });

    // Send the request to stdin
    const requestJson = JSON.stringify(request) + "\n";
    mcpProcess.stdin.write(requestJson, (error) => {
      if (error) {
        if (!responseReceived) {
          responseReceived = true;
          clearTimeout(timeout);
          reject(new Error(`Failed to write to MCP stdin: ${error.message}`));
        }
      } else {
        // End stdin after writing the request
        mcpProcess.stdin.end();
      }
    });
  });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32600,
          message: "Invalid Request: Only POST method is allowed",
        },
      },
      { status: 405 }
    );
  }

  try {
    // Parse the request body
    const body = await request.json();

    // Validate it's a valid JSON-RPC 2.0 request
    if (!body || typeof body !== "object") {
      return Response.json(
        {
          jsonrpc: "2.0",
          id: body?.id || null,
          error: {
            code: -32600,
            message: "Invalid Request: Request must be a JSON object",
          },
        },
        { status: 400 }
      );
    }

    if (body.jsonrpc !== "2.0") {
      return Response.json(
        {
          jsonrpc: "2.0",
          id: body.id || null,
          error: {
            code: -32600,
            message: "Invalid Request: jsonrpc must be '2.0'",
          },
        },
        { status: 400 }
      );
    }

    if (!body.method || typeof body.method !== "string") {
      return Response.json(
        {
          jsonrpc: "2.0",
          id: body.id || null,
          error: {
            code: -32600,
            message: "Invalid Request: method is required and must be a string",
          },
        },
        { status: 400 }
      );
    }

    // Ensure request has an ID for tracking
    const mcpRequest: MCPRequest = {
      jsonrpc: "2.0",
      id: body.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method: body.method,
      params: body.params,
    };

    // Call the MCP server
    const response = await callMCPServer(mcpRequest);

    // Return the response
    return Response.json(response, {
      status: response.error ? 400 : 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("[MCP API] Error:", error);

    // Try to extract request ID from error context if available
    let requestId: string | number | null = null;
    try {
      const body = await request.clone().json().catch(() => ({}));
      requestId = body?.id || null;
    } catch {
      // Ignore
    }

    return Response.json(
      {
        jsonrpc: "2.0",
        id: requestId,
        error: {
          code: -32603,
          message: "Internal error",
          data: error.message || "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
};

// Also support GET for health check
export const loader = async () => {
  return Response.json(
    {
      service: "Shopify Dev MCP Server HTTP Gateway",
      version: "1.0.0",
      status: "running",
      endpoints: {
        method: "POST",
        path: "/api/mcp/shopify",
        description: "Send MCP requests to Shopify Dev MCP server",
      },
      example: {
        jsonrpc: "2.0",
        id: "1",
        method: "tools/list",
        params: {},
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
