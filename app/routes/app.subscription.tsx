import type { LoaderFunctionArgs } from "react-router";
import { BlockStack, Card, Page, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function SubscriptionPage() {
  return (
    <Page>
      <TitleBar title="Subscription" />
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingLg">
              Welcome to Customer Analytics Buddy
            </Text>
            <Text as="p" tone="subdued">
              Subscription page - Coming soon
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
