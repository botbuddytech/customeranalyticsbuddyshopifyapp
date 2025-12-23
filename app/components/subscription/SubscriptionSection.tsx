import type { ReactNode } from "react";
import { Box, BlockStack, InlineStack, Text, Divider } from "@shopify/polaris";

interface SubscriptionSectionProps {
  title: string;
  description: string;
  children: ReactNode;

  /** Optional right-side header actions (e.g. buttons, links) */
  actions?: ReactNode;

  /** Show divider below section */
  showDivider?: boolean;
}

export function SubscriptionSection({
  title,
  description,
  children,
  actions,
  showDivider = false,
}: SubscriptionSectionProps) {
  return (
    <Box paddingBlockStart="400">
      <BlockStack gap="300">
        {/* Header row: title/description on top, optional actions to the right */}
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap="100">
            <Text as="h2" variant="headingMd">
              {title}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {description}
            </Text>
          </BlockStack>
          {actions && <Box paddingBlockStart="050">{actions}</Box>}
        </InlineStack>

        {/* Section content below */}
        <BlockStack gap="300">{children}</BlockStack>
      </BlockStack>

      {showDivider && (
        <Box paddingBlockStart="400">
          <Divider />
        </Box>
      )}
    </Box>
  );
}

