import { InlineStack, BlockStack, Text, Icon, Box } from "@shopify/polaris";
import { FilterIcon, CheckIcon } from "@shopify/polaris-icons";

interface Step2FilterAudienceProps {
  isCompleted: boolean;
  isAutoCompleted: boolean;
}

/**
 * Step 2: Filter customers manually using 2+ audience traits
 * 
 * This step is auto-completed when the user saves a list with 2+ filter criteria.
 * No manual "Mark Complete" button is provided.
 */
export function Step2FilterAudience({
  isCompleted,
  isAutoCompleted,
}: Step2FilterAudienceProps) {
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
            source={isCompleted ? CheckIcon : FilterIcon}
            tone={isCompleted ? "success" : "base"}
          />

          <BlockStack gap="100">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Filter customers manually using 2+ audience traits
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Create precise segments with advanced filtering options
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

