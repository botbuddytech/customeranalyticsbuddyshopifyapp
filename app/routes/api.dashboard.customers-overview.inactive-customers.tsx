import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getInactiveCustomers } from "../services/dashboard.server";

/**
 * API Route for Inactive Customers Data
 *
 * Fetches inactive customers count independently
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const data = await getInactiveCustomers(admin, dateRange);
    return Response.json(data);
  } catch (error: any) {
    if (
      error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED" ||
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED"
    ) {
      console.log(
        "[Inactive Customers API] Protected data access denied - user needs to request access in Partner Dashboard",
      );
      return Response.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
};
