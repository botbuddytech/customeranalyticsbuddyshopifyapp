import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getUserPreferences } from "../services/user-preferences.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const defaultLanguage =
    (session.locale || "en").toString().split(/[-_]/)[0] || "en";

  const prefs = await getUserPreferences(shop, defaultLanguage);
  return Response.json(prefs);
};


