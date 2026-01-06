import type { LoaderFunctionArgs } from "react-router";
import { saveMailchimpToken } from "../services/mailchimp.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    throw new Response("Missing authorization code or state", { status: 400 });
  }

  // Decode shop from state
  const { shop } = JSON.parse(Buffer.from(state, 'base64').toString());

  const clientId = process.env.MAILCHIMP_CLIENT_ID;
  const clientSecret = process.env.MAILCHIMP_CLIENT_SECRET;
  const redirectUri = process.env.MAILCHIMP_REDIRECT_URL;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Response("Mailchimp credentials not configured", { status: 500 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://login.mailchimp.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const { access_token } = await tokenResponse.json();

    // Fetch server prefix (required for API calls)
    const metadataResponse = await fetch("https://login.mailchimp.com/oauth2/metadata", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!metadataResponse.ok) {
      throw new Error("Failed to fetch Mailchimp metadata");
    }

    const { dc } = await metadataResponse.json();

    // Save to database
    await saveMailchimpToken(shop, access_token, dc);

    // Redirect back to settings page
    return Response.redirect(`/app/settings?mailchimp=connected`, 302);
  } catch (error) {
    console.error("Mailchimp OAuth error:", error);
    return Response.redirect(`/app/settings?mailchimp=error`, 302);
  }
}
