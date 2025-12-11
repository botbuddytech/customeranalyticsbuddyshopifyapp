import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getWishlistUsersQuery } from "../components/dashboard/EngagementPatterns/WishlistUsers/query";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const dateRange = url.searchParams.get("dateRange") || "30days";

  try {
    const data = await getWishlistUsersQuery(admin, dateRange);
    return Response.json(data);
  } catch (error: any) {
    throw error;
  }
};

