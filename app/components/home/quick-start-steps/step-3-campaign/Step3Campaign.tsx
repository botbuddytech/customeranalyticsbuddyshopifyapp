import { InlineStack, BlockStack, Text, Icon, Box } from "@shopify/polaris";
import { ViewIcon, CheckIcon } from "@shopify/polaris-icons";

interface Step3CampaignProps {
  isCompleted: boolean;
  isAutoCompleted: boolean;
}

/**
 * Step 3: Send your first email campaign
 * 
 * This step will be auto-completed when the email campaign feature is integrated.
 * No manual "Mark Complete" button is provided.
 */
export function Step3Campaign({
  isCompleted,
  isAutoCompleted,
}: Step3CampaignProps) {
  return (
    <Box
      padding="400"
      background={isCompleted ? "bg-surface-success" : "bg-surface"}
      borderRadius="200"
      borderWidth="025"
      borderColor={isCompleted ? "border-success" : "border"}
    >
      <InlineStack gap="300" align="space-between">
        <InlineStack gap="300" align="start">
          <Icon
            source={isCompleted ? CheckIcon : ViewIcon}
            tone={isCompleted ? "success" : "base"}
          />

          <BlockStack gap="100">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Send your first email campaign
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Engage your segments with targeted messaging
              {isAutoCompleted && (
                <Text as="span" tone="success" fontWeight="medium">
                  {" "}
                  (Auto-completed)
                </Text>
              )}
            </Text>
          </BlockStack>
        </InlineStack>

        {isCompleted && (
          <Text as="span" variant="bodySm" tone="subdued" fontWeight="medium">
            Auto-completed
          </Text>
        )}
      </InlineStack>
    </Box>
  );
}

