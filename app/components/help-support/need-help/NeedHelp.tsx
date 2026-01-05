import { BlockStack, Text, InlineGrid } from "@shopify/polaris";
import { SupportChannelCard, SUPPORT_CHANNELS } from "../support-channel-card";

/**
 * Need Help Component
 * 
 * Displays support channel cards in a grid layout
 */
export function NeedHelp() {
  return (
    <BlockStack gap="400">
      <BlockStack gap="200">
        <Text as="h2" variant="headingLg">
          Need Help?
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          You can reach us anytime using one of the following support channels:
        </Text>
      </BlockStack>

      <InlineGrid
        columns={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}
        gap={{ xs: "400", sm: "400", md: "400", lg: "400", xl: "400" }}
      >
        {SUPPORT_CHANNELS.map((channel, index) => (
          <SupportChannelCard key={index} channel={channel} />
        ))}
      </InlineGrid>
    </BlockStack>
  );
}

