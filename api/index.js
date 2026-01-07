// Dynamically import to ensure environment variables are loaded first
let handleRequest;
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

    // Lazy load the server build and entry module AFTER environment variables are verified
    if (!serverBuild) {
      serverBuild = await import("../build/server/index.js");
      
      // entry.module contains the actual entry.server.tsx module
      const entryModule = serverBuild.entry.module;
      handleRequest = entryModule.default;
      
      if (typeof handleRequest !== "function") {
        throw new Error(`Entry module does not export default function. Available: ${Object.keys(entryModule).join(", ")}`);
      }
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

    // Use React Router's createStaticHandler to create EntryContext
    const { createStaticHandler } = await import("react-router");
    const staticHandler = createStaticHandler(serverBuild.routes);
    
    // Handle the request using the static handler
    const context = await staticHandler.query(request);
    
    // Create EntryContext from the static handler context
    const entryContext = {
      staticHandlerContext: context,
      serverHandoffString: "",
      future: serverBuild.future || {},
      isSpaMode: serverBuild.isSpaMode || false,
      serializeError: (error) => {
        return JSON.stringify({ message: error.message, stack: error.stack });
      },
    };
    
    // Call handleRequest with the EntryContext
    const responseHeaders = new Headers();
    const response = await handleRequest(
      request,
      context.statusCode || 200,
      responseHeaders,
      entryContext
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
