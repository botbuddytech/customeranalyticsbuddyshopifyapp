import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getTotalCustomers } from "../services/dashboard.server";

/**
 * API Route for Total Customers Data
 * 
 * Fetches total customers count independently
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const data = await getTotalCustomers(admin, dateRange);
    return Response.json(data);
  } catch (error: any) {
    if (error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
      console.log("[Total Customers API] Protected customer data access denied - user needs to request access in Partner Dashboard");
      return Response.json(
        { error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }
    throw error;
  }
};

