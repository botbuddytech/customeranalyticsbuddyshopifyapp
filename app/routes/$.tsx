import { SimpleNotFoundPage } from "../components/SimpleNotFoundPage";

/**
 * Catch-all route for unmatched routes outside of /app/*
 * This handles 404 errors gracefully without throwing exceptions
 * Uses SimpleNotFoundPage since this route doesn't go through app.tsx (no Polaris context)
 */
export default function NotFoundRoute() {
  return <SimpleNotFoundPage />;
}
