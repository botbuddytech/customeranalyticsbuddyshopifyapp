import type { LoaderFunctionArgs } from "react-router";
import { Page, Frame } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { SubscriptionPageContent } from "../components/subscription";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function SubscriptionPage() {
  return (
    <Frame>
      <Page>
        <TitleBar title="Subscription" />
        <SubscriptionPageContent />
      </Page>
    </Frame>
  );
}
