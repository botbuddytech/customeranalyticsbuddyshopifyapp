import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getNewCustomers } from "../services/dashboard.server";

/**
 * API Route for New Customers Data
 * 
 * Fetches new customers count independently
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const data = await getNewCustomers(admin, dateRange);
    return Response.json(data);
  } catch (error: any) {
    if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      console.log("[New Customers API] Protected customer data access denied - user needs to request access in Partner Dashboard");
      return Response.json(
        { error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }
    throw error;
  }
};

