import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getBehavioralBreakdownQuery } from "../components/dashboard/VisualAnalytics/BehavioralBreakdown/query";

/**
 * API Route for Behavioral Breakdown Chart Data
 * 
 * Fetches engagement metrics for bar chart
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const data = await getBehavioralBreakdownQuery(admin, dateRange);

    // Format chart data
    const chartData = {
      labels: [
        "Discount Users",
        "Wishlist Users",
        "Reviewers",
        "Email Subscribers",
      ],
      datasets: [
        {
          label: "Number of Users",
          data: [
            data.discountUsers,
            data.wishlistUsers,
            data.reviewers,
            data.emailSubscribers,
          ],
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };

    return Response.json({ chartData });
  } catch (error: any) {
    if (
      error.message === "PROTECTED_ORDER_DATA_ACCESS_DENIED" ||
      error.message === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED"
    ) {
      console.log(
        "[Behavioral Breakdown API] Protected data access denied - user needs to request access in Partner Dashboard",
      );
      return Response.json(
        { error: error.message },
        { status: 403 }
      );
    }
    console.error(
      "[Behavioral Breakdown API] Error:",
      error.message || error
    );
    return Response.json(
      { error: "Failed to load behavioral breakdown data" },
      { status: 500 }
    );
  }
};

