import pkg from "@react-router/node";
const { installGlobals } = pkg;

installGlobals();

export default async function handler(req, res) {
  try {
    // Verify critical environment variables are available
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      console.error("Missing Shopify environment variables:");
      console.error("SHOPIFY_API_KEY:", process.env.SHOPIFY_API_KEY ? "✓" : "✗");
      console.error("SHOPIFY_API_SECRET:", process.env.SHOPIFY_API_SECRET ? "✓" : "✗");
      throw new Error("Missing required Shopify API credentials. Please check Vercel environment variables.");
    }

    // Dynamically import server build AFTER environment variables are verified
    // This ensures env vars are available when shopify.server.ts initializes
    const serverBuild = await import("../build/server/index.js");
    
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

