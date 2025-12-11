import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getEngagementPatterns } from "../services/dashboard.server";

/**
 * API Route for Engagement Patterns Data
 * 
 * Fetches engagement pattern metrics independently
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  const data = await getEngagementPatterns(admin, dateRange);
  return Response.json(data);
};

