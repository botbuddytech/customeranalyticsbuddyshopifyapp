import pkg from "@react-router/node";
const { installGlobals } = pkg;
import * as serverBuild from "../build/server/index.js";

installGlobals();

export default async function handler(req, res) {
  try {
    // Create a Request object from Vercel's request
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || req.headers["x-forwarded-host"];
    const url = new URL(req.url, `${protocol}://${host}`);
    
    const request = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.method !== "GET" && req.method !== "HEAD" && req.body
        ? JSON.stringify(req.body)
        : undefined,
    });

    // Use the server build's default export (handleRequest from entry.server.tsx)
    const handleRequest = serverBuild.default;
    
    if (!handleRequest) {
      throw new Error("Server build does not export a default function");
    }

    // Call the React Router server handler
    // handleRequest expects: (request, responseStatusCode, responseHeaders, reactRouterContext)
    const response = await handleRequest(
      request,
      200,
      new Headers(),
      serverBuild
    );

    // Convert Response to Vercel response
    const body = await response.text();
    
    // Set status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    res.send(body);
  } catch (error) {
    console.error("Serverless function error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}

