import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getCancelledOrdersQuery } from "../components/dashboard/PurchaseOrderBehavior/CancelledOrders/query";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const data = await getCancelledOrdersQuery(admin, dateRange);
    return Response.json(data);
  } catch (error: any) {
    if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED") {
      console.log(
        "[Cancelled Orders API] Protected order data access denied - user needs to request access in Partner Dashboard",
      );
      return Response.json(
        { error: "PROTECTED_ORDER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }
    throw error;
  }
};

