import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { NotFoundPage } from "../components/NotFoundPage";

/**
 * Catch-all route for unmatched /app/* routes
 * This handles 404 errors gracefully without throwing exceptions
 * Returns a 404 status but renders a nice page instead of an error
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Authenticate the request (required for all /app routes)
  await authenticate.admin(request);
  
  // Return a 404 response, but React Router will still render our component
  // This way it's a proper 404 status but shows a nice page
  throw new Response("Page Not Found", { status: 404 });
};

export default function NotFoundRoute() {
  return <NotFoundPage />;
}
