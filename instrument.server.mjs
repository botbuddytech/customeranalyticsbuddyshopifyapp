import * as Sentry from '@sentry/react-router';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Only initialize Sentry in production environment
// This prevents development errors from being sent to Sentry
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

if (isProduction) {
  Sentry.init({
    dsn: "https://8c04356c62e9e3cead76d5e729341d18@o4510685003841536.ingest.us.sentry.io/4510685013999616",

    // Set environment explicitly
    environment: process.env.VERCEL_ENV || 'production',

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    profilesSampleRate: 1.0, // profile every transaction

    // Set up performance monitoring
    beforeSend(event) {
      // Filter out 404s from error reporting
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === "NotFoundException" || error?.value?.includes("404")) {
          return null;
        }
      }
      return event;
    },
  });
} else {
  console.log('[Sentry] Skipping initialization in development environment');
}