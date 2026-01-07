// Dynamically import to ensure environment variables are loaded first
let serverBuild;

export default async function handler(req, res) {
  try {
    // Verify critical environment variables are available
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      console.error("Missing Shopify environment variables:");
      console.error("SHOPIFY_API_KEY:", process.env.SHOPIFY_API_KEY ? "✓" : "✗");
      console.error("SHOPIFY_API_SECRET:", process.env.SHOPIFY_API_SECRET ? "✓" : "✗");
      throw new Error("Missing required Shopify API credentials. Please check Vercel environment variables.");
    }

    // Lazy load the server build AFTER environment variables are verified
    // This ensures env vars are available when shopify.server.ts initializes
    if (!serverBuild) {
      serverBuild = await import("../build/server/index.js");
      
      // Log what the server build exports for debugging
      console.log("Server build exports:", Object.keys(serverBuild));
      console.log("Default export type:", typeof serverBuild.default);
    }
    
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

    // React Router v7's server build exports handleDocumentRequest
    // which is the main entry point for handling requests
    let response;
    if (typeof serverBuild.handleDocumentRequest === "function") {
      response = await serverBuild.handleDocumentRequest(request);
    } else if (typeof serverBuild.default === "function") {
      // If handleDocumentRequest doesn't exist, try the default export
      // This should be handleRequest from entry.server.tsx
      // But it needs EntryContext which we need to create
      throw new Error("Default export found but EntryContext creation not implemented. Server build exports: " + Object.keys(serverBuild).join(", "));
    } else {
      throw new Error(`No request handler found. Server build exports: ${Object.keys(serverBuild).join(", ")}`);
    }

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

