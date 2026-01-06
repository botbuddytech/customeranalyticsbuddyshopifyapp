import { InlineStack, BlockStack, Text, Icon, Box } from "@shopify/polaris";
import { PersonIcon, CheckIcon } from "@shopify/polaris-icons";

interface Step1AISegmentProps {
  isCompleted: boolean;
  isAutoCompleted: boolean;
}

/**
 * Step 1: Use AI to generate your first customer segment
 * 
 * This step is auto-completed when the user generates their first AI list.
 * No manual "Mark Complete" button is provided.
 */
export function Step1AISegment({
  isCompleted,
  isAutoCompleted,
}: Step1AISegmentProps) {
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
            source={isCompleted ? CheckIcon : PersonIcon}
            tone={isCompleted ? "success" : "base"}
          />

          <BlockStack gap="100">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Use AI to generate your first customer segment
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Let AI analyze your customers and create smart segments
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

