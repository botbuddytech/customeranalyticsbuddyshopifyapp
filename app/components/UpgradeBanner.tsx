import { useState } from "react";
import { Box, InlineStack, Text, Button } from "@shopify/polaris";

interface UpgradeBannerProps {
  currentPlan?: string | null;
  isDevMode?: boolean;
}

export function UpgradeBanner({
  currentPlan,
  isDevMode = false,
}: UpgradeBannerProps) {
  const [visible, setVisible] = useState(true);

  // Check if user is on free plan (no plan or plan name contains "Free")
  // In dev mode, don't show the banner
  const isFreePlan =
    !isDevMode && (!currentPlan || currentPlan.toLowerCase().includes("free"));

  if (!visible || !isFreePlan) return null;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 500,
        backgroundColor: "#FFEAEA", // soft red, eye-catchy but not harsh
      }}
    >
      <Box borderBlockEndWidth="025" borderColor="border" padding="400">
        <InlineStack align="space-between" gap="400">
          <Text as="p" variant="bodyMd">
            🚀 <strong>Upgrade to Pro</strong> to unlock advanced analytics, AI
            insights, and email marketing.
          </Text>

          <InlineStack gap="200">
            <Button
              variant="primary"
              onClick={() => {
                // Navigate to Shopify billing settings page
                // Open in new tab to ensure it works in embedded apps
                window.open("/settings/billing", "_top");
              }}
            >
              Upgrade
            </Button>

            <Button variant="tertiary" onClick={() => setVisible(false)}>
              Dismiss
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>
    </div>
  );
}
