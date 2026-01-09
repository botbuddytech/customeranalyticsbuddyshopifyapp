import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const clientId = process.env.MAILCHIMP_CLIENT_ID;

  if (!clientId) {
    throw new Response("Mailchimp credentials not configured", { status: 500 });
  }

  // Determine redirect URL:
  // 1. Use MAILCHIMP_REDIRECT_URL if set (recommended for production)
  // 2. Otherwise, dynamically determine from current request (for development)
  let redirectUri = process.env.MAILCHIMP_REDIRECT_URL;
  
  if (!redirectUri) {
    // Dynamically determine redirect URL from the current request
    // This allows it to work with both development tunnel URLs and production URLs
    const url = new URL(request.url);
    const protocol = url.protocol; // http or https
    const host = url.host; // e.g., retreat-scientist-retailer-voip.trycloudflare.com or customeranalyticsbuddyapp.vercel.app
    
    // Build the redirect URI dynamically based on current request
    // Remove trailing slash if present and ensure consistent format
    redirectUri = `${protocol}//${host}/api/mailchimp/callback`.replace(/\/$/, '').trim();
  } else {
    // Normalize the redirect URI from env var
    redirectUri = redirectUri.trim().replace(/\/$/, '');
  }

  console.log("[Mailchimp OAuth] Authorize - Using redirect_uri:", redirectUri);
  console.log("[Mailchimp OAuth] Authorize - Request URL:", request.url);

  // Store shop ID AND redirect_uri in state parameter for callback
  // This ensures we use the EXACT same redirect_uri in the token exchange
  const state = Buffer.from(JSON.stringify({ 
    shop: session.shop,
    redirect_uri: redirectUri 
  })).toString('base64');

  const authUrl = new URL("https://login.mailchimp.com/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  // Return the URL so frontend can use App Bridge redirect
  return Response.json({ authUrl: authUrl.toString() });
}
