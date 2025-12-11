import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getOrderBehavior } from "../services/dashboard.server";

/**
 * API Route for Order Behavior Data
 * 
 * Fetches order behavior metrics independently
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  const data = await getOrderBehavior(admin, dateRange);
  return Response.json(data);
};

