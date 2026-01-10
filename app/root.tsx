import * as Sentry from "@sentry/react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from "react-router";
import "@shopify/polaris/build/esm/styles.css";
import { NotFoundPage } from "./components/NotFoundPage";

export function ErrorBoundary({ error }) {
  // Handle 404 errors gracefully - don't treat them as errors
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;

  if (isRouteErrorResponse(error)) {
    message = "Error";
    details = error.statusText || details;
  } else if (error && error instanceof Error) {
    // Ignore abort errors - these are expected when navigation happens
    // or when requests are cancelled
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      // Silently ignore abort errors - they're not real errors
      return (
        <main>
          <h1>Request Cancelled</h1>
          <p>The request was cancelled. This is normal when navigating between pages.</p>
        </main>
      );
    }
    
    // Only capture non-404, non-abort errors in production
    // Check if Sentry is initialized (only in production)
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      Sentry.captureException(error);
    }
    details = error.message;
    stack = error.stack;
  }

  return (
    <main>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}