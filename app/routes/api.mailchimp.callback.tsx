import type { LoaderFunctionArgs } from "react-router";
import { saveMailchimpToken } from "../services/mailchimp.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    // Return error page that closes popup and notifies parent
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mailchimp Connection</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f6f6f7;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .error {
              color: #d72c0d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Connection Failed</h2>
            <p>Missing authorization code or state parameter.</p>
            <p style="font-size: 0.875rem; color: #6b7280;">This window will close automatically...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'MAILCHIMP_OAUTH_ERROR',
                message: 'Missing authorization code or state parameter'
              }, window.location.origin);
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Decode shop and redirect_uri from state
  let shop: string;
  let redirectUriFromState: string | undefined;
  try {
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
    shop = decodedState.shop;
    redirectUriFromState = decodedState.redirect_uri;
  } catch (error) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mailchimp Connection</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f6f6f7;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .error {
              color: #d72c0d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Connection Failed</h2>
            <p>Invalid state parameter.</p>
            <p style="font-size: 0.875rem; color: #6b7280;">This window will close automatically...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'MAILCHIMP_OAUTH_ERROR',
                message: 'Invalid state parameter'
              }, window.location.origin);
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  const clientId = process.env.MAILCHIMP_CLIENT_ID;
  const clientSecret = process.env.MAILCHIMP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mailchimp Connection</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f6f6f7;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .error {
              color: #d72c0d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Configuration Error</h2>
            <p>Mailchimp credentials not configured.</p>
            <p style="font-size: 0.875rem; color: #6b7280;">This window will close automatically...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'MAILCHIMP_OAUTH_ERROR',
                message: 'Mailchimp credentials not configured'
              }, window.location.origin);
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  try {
    // Determine redirect URI - MUST match exactly what was used in authorize request
    // Priority:
    // 1. Use redirect_uri from state (most reliable - exact match)
    // 2. Use MAILCHIMP_REDIRECT_URL if set
    // 3. Otherwise, dynamically determine from current request
    let redirectUri = redirectUriFromState || process.env.MAILCHIMP_REDIRECT_URL;
    
    if (!redirectUri) {
      // Dynamically determine redirect URI from the current request
      // This must match what was sent in the authorize request
      const callbackUrl = new URL(request.url);
      const protocol = callbackUrl.protocol;
      const host = callbackUrl.host;
      redirectUri = `${protocol}//${host}/api/mailchimp/callback`.replace(/\/$/, '');
    }

    // Ensure no trailing slash and normalize
    redirectUri = redirectUri.trim().replace(/\/$/, '');

    // Log all redirect URI sources for debugging
    console.log("[Mailchimp OAuth] Redirect URI sources:", {
      fromState: redirectUriFromState,
      fromEnv: process.env.MAILCHIMP_REDIRECT_URL,
      final: redirectUri,
      callbackUrl: request.url
    });
    console.log("[Mailchimp OAuth] Exchanging token with redirect_uri:", redirectUri);
    console.log("[Mailchimp OAuth] Code:", code ? "present" : "missing");
    console.log("[Mailchimp OAuth] Client ID:", clientId ? "present" : "missing");

    // Mailchimp requires form data, not JSON
    // URLSearchParams automatically URL-encodes the values
    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", clientId);
    formData.append("client_secret", clientSecret);
    formData.append("redirect_uri", redirectUri); // URLSearchParams will encode this
    formData.append("code", code);

    console.log("[Mailchimp OAuth] Form data being sent:", {
      grant_type: "authorization_code",
      client_id: clientId ? "present" : "missing",
      client_secret: clientSecret ? "present" : "missing",
      redirect_uri: redirectUri,
      code: code ? "present" : "missing"
    });

    // Exchange code for access token
    const tokenResponse = await fetch("https://login.mailchimp.com/oauth2/token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[Mailchimp OAuth] Token exchange failed:", errorText);
      console.error("[Mailchimp OAuth] Status:", tokenResponse.status);
      console.error("[Mailchimp OAuth] Redirect URI used:", redirectUri);
      throw new Error(`Failed to exchange code for token: ${errorText}`);
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

    // Return success page that closes popup and notifies parent
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mailchimp Connection</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f6f6f7;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .success {
              color: #008060;
            }
            .spinner {
              border: 3px solid #f3f3f3;
              border-top: 3px solid #008060;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              animation: spin 1s linear infinite;
              margin: 1rem auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="success">✅ Successfully Connected!</h2>
            <p>Your Mailchimp account has been connected.</p>
            <div class="spinner"></div>
            <p style="font-size: 0.875rem; color: #6b7280;">This window will close automatically...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'MAILCHIMP_OAUTH_SUCCESS'
              }, window.location.origin);
              setTimeout(() => window.close(), 1500);
            } else {
              // Fallback: redirect if opened in same window
              setTimeout(() => {
                window.location.href = '/app/settings?mailchimp=connected';
              }, 1500);
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("[Mailchimp OAuth] Full error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    // Log additional debugging info
    console.error("[Mailchimp OAuth] Error details:", {
      message: errorMessage,
      code: code ? "present" : "missing",
      state: state ? "present" : "missing",
      clientId: clientId ? "present" : "missing",
      clientSecret: clientSecret ? "present" : "missing",
      redirectUriFromState,
    });
    
    // Return error page that closes popup and notifies parent
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mailchimp Connection</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f6f6f7;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .error {
              color: #d72c0d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">❌ Connection Failed</h2>
            <p>${errorMessage}</p>
            <p style="font-size: 0.875rem; color: #6b7280;">This window will close automatically...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'MAILCHIMP_OAUTH_ERROR',
                message: '${errorMessage.replace(/'/g, "\\'")}'
              }, window.location.origin);
              setTimeout(() => window.close(), 2000);
            } else {
              // Fallback: redirect if opened in same window
              setTimeout(() => {
                window.location.href = '/app/settings?mailchimp=error';
              }, 2000);
            }
          </script>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
