import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getCustomerSegmentation, getBehavioralBreakdown } from "../services/dashboard.server";

/**
 * API Route for Visual Analytics Data
 * 
 * Fetches chart data independently
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  const [customerSegmentation, behavioralBreakdown] = await Promise.all([
    getCustomerSegmentation(admin, dateRange),
    getBehavioralBreakdown(admin, dateRange)
  ]);

  // Format chart data
  const orderTypeData = {
    labels: [
      "COD Orders",
      "Prepaid Orders",
      "Cancelled Orders",
      "Abandoned Carts",
    ],
    datasets: [
      {
        data: [
          customerSegmentation.codOrders,
          customerSegmentation.prepaidOrders,
          customerSegmentation.cancelledOrders,
          customerSegmentation.abandonedOrders,
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

  const engagementData = {
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
          behavioralBreakdown.discountUsers,
          behavioralBreakdown.wishlistUsers,
          behavioralBreakdown.reviewers,
          behavioralBreakdown.emailSubscribers,
        ],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return Response.json({
    orderTypeData,
    engagementData
  });
};

