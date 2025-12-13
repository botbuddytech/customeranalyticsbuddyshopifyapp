import { Card, BlockStack, Text, Button } from "@shopify/polaris";
import { ExportIcon, ViewIcon, EmailIcon } from "@shopify/polaris-icons";

/**
 * Quick Actions Settings Card Component
 * 
 * Displays quick action buttons for common tasks
 */
export function QuickActionsCard() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          ⚡ Quick Actions
        </Text>

        <BlockStack gap="200">
          <Button
            variant="secondary"
            fullWidth
            icon={ExportIcon}
            onClick={() => {/* Export all data */}}
          >
            Export All Data
          </Button>

          <Button
            variant="secondary"
            fullWidth
            icon={ViewIcon}
            url="/app/help"
          >
            View Documentation
          </Button>

          <Button
            variant="secondary"
            fullWidth
            icon={EmailIcon}
            url="mailto:support@audienceinsight.com"
            external
          >
            Contact Support
          </Button>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

