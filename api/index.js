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

    // React Router v7's server build exports:
    // - entry: The entry.server.tsx module (exports handleRequest as default)
    // - routes: Route definitions
    // We need to use React Router's request handling
    
    // Import the entry module to get handleRequest
    const entryModule = serverBuild.entry;
    const handleRequest = entryModule?.default;
    
    if (typeof handleRequest !== "function") {
      throw new Error(`Entry module does not export a default function. Entry module: ${entryModule ? Object.keys(entryModule).join(", ") : "null"}`);
    }
    
    // Use React Router's handleDocumentRequest if available, otherwise create EntryContext manually
    // First, try to use @react-router/node's utilities to create a proper handler
    let response;
    
    try {
      // Try to use React Router's built-in request handling
      // We'll create a minimal EntryContext and call handleRequest
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
      response = await handleRequest(
        request,
        context.statusCode || 200,
        responseHeaders,
        entryContext
      );
    } catch (handlerError) {
      console.error("Error creating handler context:", handlerError);
      throw handlerError;
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

