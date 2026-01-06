import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const clientId = process.env.MAILCHIMP_CLIENT_ID;
  const redirectUri = process.env.MAILCHIMP_REDIRECT_URL;

  if (!clientId || !redirectUri) {
    throw new Response("Mailchimp credentials not configured", { status: 500 });
  }

  // Store shop ID in state parameter for callback
  const state = Buffer.from(JSON.stringify({ shop: session.shop })).toString('base64');

  const authUrl = new URL("https://login.mailchimp.com/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  // Return the URL so frontend can use App Bridge redirect
  return Response.json({ authUrl: authUrl.toString() });
}
