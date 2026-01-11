/**
 * API Route for Shopify Dev MCP Server
 * 
 * Exposes the Shopify Dev MCP server as an HTTP REST endpoint.
 * Accepts MCP requests over HTTP and forwards them to @shopify/dev-mcp via npx.
 */

import type { ActionFunctionArgs } from "react-router";
import { spawn } from "child_process";

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
 * Spawns the Shopify Dev MCP server and sends a request
 */
async function callMCPServer(request: MCPRequest): Promise<MCPResponse> {
  return new Promise((resolve, reject) => {
    // Spawn the MCP server via npx
    // Use cmd /c on Windows, otherwise use sh -c
    const isWindows = process.platform === "win32";
    const command = isWindows ? "cmd" : "sh";
    const args = isWindows
      ? ["/c", "npx", "-y", "@shopify/dev-mcp@latest"]
      : ["-c", "npx -y @shopify/dev-mcp@latest"];

    const mcpProcess = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        // Disable instrumentation for cleaner output
        OPT_OUT_INSTRUMENTATION: "true",
      },
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
      // Log stderr but don't fail on it (MCP server may output warnings)
      if (process.env.NODE_ENV === "development") {
        console.warn("[MCP stderr]:", data.toString());
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
