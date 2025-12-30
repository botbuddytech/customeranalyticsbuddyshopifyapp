import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getUserPreferences } from "../services/user-preferences.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  /* session.locale is not available on standard Session object */
  const defaultLanguage = "en";

  const prefs = await getUserPreferences(shop, defaultLanguage);
  return Response.json(prefs);
};


