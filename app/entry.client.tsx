import * as Sentry from "@sentry/react-router";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// Only initialize Sentry in production environment
// This prevents development errors from being sent to Sentry
const isProduction = 
  typeof window !== 'undefined' && 
  (window.location.hostname === 'customeranalyticsbuddyapp.vercel.app' ||
   process.env.NODE_ENV === 'production' ||
   import.meta.env?.PROD === true);

if (isProduction) {
  Sentry.init({
    dsn: "https://8c04356c62e9e3cead76d5e729341d18@o4510685003841536.ingest.us.sentry.io/4510685013999616",
    
    // Set environment explicitly
    environment: 'production',
    
    sendDefaultPii: true,
    integrations: [Sentry.reactRouterTracingIntegration(), Sentry.replayIntegration()],
    enableLogs: true,
    tracesSampleRate: 1.0,
    tracePropagationTargets: [/^\//, /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
} else {
  console.log('[Sentry] Skipping initialization in development environment');
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});