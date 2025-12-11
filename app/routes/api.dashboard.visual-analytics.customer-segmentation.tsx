import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getCustomerSegmentationQuery } from "../components/dashboard/VisualAnalytics/CustomerSegmentation/query";

/**
 * API Route for Customer Segmentation Chart Data
 * 
 * Fetches order type distribution for pie chart
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const data = await getCustomerSegmentationQuery(admin, dateRange);

    // Format chart data
    const chartData = {
      labels: [
        "COD Orders",
        "Prepaid Orders",
        "Cancelled Orders",
        "Abandoned Carts",
      ],
      datasets: [
        {
          data: [
            data.codOrders,
            data.prepaidOrders,
            data.cancelledOrders,
            data.abandonedCarts,
          ],
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    return Response.json({ chartData });
  } catch (error: any) {
    if (error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED") {
      console.log(
        "[Customer Segmentation API] Protected order data access denied - user needs to request access in Partner Dashboard",
      );
      return Response.json(
        { error: "PROTECTED_ORDER_DATA_ACCESS_DENIED" },
        { status: 403 }
      );
    }
    console.error(
      "[Customer Segmentation API] Error:",
      error.message || error
    );
    return Response.json(
      { error: "Failed to load customer segmentation data" },
      { status: 500 }
    );
  }
};

