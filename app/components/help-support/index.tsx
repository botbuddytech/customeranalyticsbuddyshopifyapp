import { Page, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { NeedHelp } from "./need-help";
import { Resources } from "./resources";

/**
 * Help and Support Component
 *
 * Provides users with resources, documentation, and support options
 */
export function HelpAndSupport() {
  return (
    <Page>
      <TitleBar title="Help & Support" />

      <BlockStack gap="600">
        {/* Need Help Section */}
        <NeedHelp />

        {/* Resources Section - Videos & Tutorials, App Documentation, and Getting Started */}
        <Resources />
      </BlockStack>
    </Page>
  );
}
