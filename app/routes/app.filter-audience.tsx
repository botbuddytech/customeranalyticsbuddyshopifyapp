/**
 * Filter Audience Page for AI Audience Insight Shopify App
 *
 * This page provides a comprehensive filtering interface for creating
 * targeted customer segments based on various criteria including:
 * - Geographic location and demographics
 * - Purchase behavior and product preferences
 * - Device usage and browsing patterns
 * - Engagement metrics and customer lifecycle
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  BlockStack,
  InlineStack,
  Text,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { AudienceFilterForm } from "../components/filter-audience";
import {
  getProducts,
  getCollections,
  getProductTypes,
  getUniqueCountries,
  getUniquePaymentGateways,
  getUniqueShippingMethods,
} from "../services/products.server";
import { getSavedListById } from "../services/saved-lists.server";
import type { FilterData } from "../components/filter-audience/types";

// Loader function to authenticate and provide initial data
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;
  const url = new URL(request.url);
  const modifyListId = url.searchParams.get("modify");

  // Fetch saved list if modifying
  let savedList = null;
  let initialFilters: FilterData | null = null;
  let listName = "";
  
  if (modifyListId) {
    try {
      savedList = await getSavedListById(shop, modifyListId);
      if (savedList) {
        initialFilters = savedList.queryData;
        listName = savedList.listName;
      }
    } catch (error) {
      console.error("[Filter Audience Loader] Error fetching saved list:", error);
    }
  }

  try {
    // Fetch products, collections, product types, countries, payment gateways, and shipping methods from Shopify
    const [
      products,
      collections,
      productTypes,
      countries,
      paymentGateways,
      shippingMethods,
    ] = await Promise.all([
      getProducts(admin),
      getCollections(admin),
      getProductTypes(admin),
      getUniqueCountries(admin),
      getUniquePaymentGateways(admin),
      getUniqueShippingMethods(admin),
    ]);

    // Build category -> products tree structure
    const categoryMap = new Map<string, string[]>();
    products.forEach((p) => {
      if (p.status === "ACTIVE") {
        const type = p.productType || "Uncategorized";
        if (!categoryMap.has(type)) {
          categoryMap.set(type, []);
        }
        categoryMap.get(type)!.push(p.title);
      }
    });

    const productOptions = Array.from(categoryMap.entries()).map(
      ([category, prods]) => ({
        label: category,
        value: category,
        children: prods.sort().map((p) => ({ label: p, value: p })),
      })
    ).sort((a, b) => a.label.localeCompare(b.label));

    // Format collections for display
    const collectionOptions = collections.map((c) => c.title);

    // Format product types (categories) for display
    const categoryOptions = productTypes;

    // Map payment gateway names to user-friendly names
    const paymentMethodOptions =
      mapPaymentGatewaysToUserFriendly(paymentGateways);

    // Map shipping methods to user-friendly names (keep original titles as well)
    const deliveryMethodOptions =
      mapShippingMethodsToUserFriendly(shippingMethods);

    return {
      products: productOptions,
      collections: collectionOptions,
      categories: categoryOptions,
      countries: countries,
      paymentMethods: paymentMethodOptions,
      deliveryMethods: deliveryMethodOptions,
      initialFilters,
      listId: modifyListId || null,
      listName,
    };
  } catch (error) {
    console.error("[Filter Audience Loader] Error fetching data:", error);
    // Return empty arrays on error
      return {
      products: [],
      collections: [],
      categories: [],
      countries: [],
      paymentMethods: [],
      deliveryMethods: [],
      initialFilters: null,
      listId: null,
      listName: "",
    };
  }
};

/**
 * Map Shopify payment gateway names to user-friendly names
 */
function mapPaymentGatewaysToUserFriendly(gateways: string[]): string[] {
  const userFriendlyMap: Record<string, string> = {
    shopify_payments: "Shop Pay",
    paypal: "PayPal",
    paypal_express: "PayPal",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
    amazon_payments: "Amazon Pay",
    klarna: "Klarna",
    afterpay: "Afterpay",
    affirm: "Affirm",
    sezzle: "Sezzle",
    stripe: "Credit Card",
    authorize_net: "Credit Card",
    braintree: "Credit Card",
    first_data: "Credit Card",
    cybersource: "Credit Card",
    worldpay: "Credit Card",
    adyen: "Credit Card",
    manual: "Cash on Delivery",
    bogus: "Cash on Delivery",
    gift_card: "Gift Card",
    store_credit: "Store Credit",
    bank_transfer: "Bank Transfer",
  };

  const mapped = new Set<string>();

  gateways.forEach((gateway) => {
    const gatewayLower = gateway.toLowerCase();
    const friendlyName = userFriendlyMap[gatewayLower];
    if (friendlyName) {
      mapped.add(friendlyName);
    } else {
      // If not in map, use the gateway name as-is (capitalize first letter)
      mapped.add(
        gateway.charAt(0).toUpperCase() + gateway.slice(1).replace(/_/g, " "),
      );
    }
  });

  return Array.from(mapped).sort();
}

/**
 * Map Shopify shipping method titles to user-friendly names
 * Also keeps original titles for flexibility
 */
function mapShippingMethodsToUserFriendly(methods: string[]): string[] {
  const userFriendlyMap: Record<string, string> = {
    "standard shipping": "Standard Shipping",
    "express shipping": "Express Shipping",
    "free shipping": "Free Shipping",
    "local pickup": "Local Pickup",
    "same-day delivery": "Same-day Delivery",
    "international shipping": "International Shipping",
    "scheduled delivery": "Scheduled Delivery",
  };

  const mapped = new Set<string>();

  methods.forEach((method) => {
    const methodLower = method.toLowerCase();
    const friendlyName = userFriendlyMap[methodLower];
    if (friendlyName) {
      mapped.add(friendlyName);
    } else {
      // Keep original title as well for flexibility
      mapped.add(method);
    }
  });

  return Array.from(mapped).sort();
}

// Action function to handle form submissions
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  // Get form data
  const formData = await request.formData();
  const filterData = Object.fromEntries(formData);

  // In a real app, this would create a Prisma query or Shopify GraphQL query
  // For now, we'll just return the filter data
  return {
    success: true,
    filterData,
    matchCount: Math.floor(Math.random() * 100), // Mock count of matching customers
  };
};

/**
 * Main Filter Audience Page Component
 *
 * Provides a compact, modern interface for creating customer segments
 * with comprehensive filtering options and real-time preview.
 */
export default function FilterAudiencePage() {
  const data = useLoaderData<typeof loader>();
  const isLoading =
    data.products.length === 0 &&
    data.countries.length === 0 &&
    data.paymentMethods.length === 0 &&
    data.deliveryMethods.length === 0;

  return (
    <Page fullWidth>
      <TitleBar title={data.listId ? "Modify List" : "Filter Audience"} />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <InlineStack align="space-between" blockAlign="center">
              <BlockStack gap="100">
                <Text as="h1" variant="headingLg">
                  {data.listId ? "✏️ Modify List" : "🎯 Filter Audience"}
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {data.listId
                    ? `Modifying: ${data.listName}`
                    : "Create targeted customer segments with advanced filters"}
                </Text>
              </BlockStack>
              <Badge tone="info">
                {data.listId ? "Modify Mode" : "Segment Builder"}
              </Badge>
            </InlineStack>

            <AudienceFilterForm
              products={data.products}
              collections={data.collections}
              categories={data.categories}
              countries={data.countries}
              paymentMethods={data.paymentMethods}
              deliveryMethods={data.deliveryMethods}
              isLoading={isLoading}
              initialFilters={data.initialFilters}
              listId={data.listId}
              listName={data.listName}
            />
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
