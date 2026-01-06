import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getReturningCustomers } from "../services/dashboard.server";

/**
 * API Route for Returning Customers Data
 * 
 * Fetches returning customers count independently
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const data = await getReturningCustomers(admin, dateRange);
    return Response.json(data);
  } catch (error: any) {
    if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED") {
      console.log("[Returning Customers API] Protected order data access denied - user needs to request access in Partner Dashboard");
      return Response.json(
        { error: "PROTECTED_ORDER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }
    throw error;
  }
};

