import {
  BlockStack,
  Card,
  InlineStack,
  Spinner,
  Text,
  Box,
} from "@shopify/polaris";

interface ProcessingStepsCardProps {
  isLoading: boolean;
  processingSteps: string[];
}

/**
 * Processing Steps Card
 *
 * Shows the AI processing steps while analyzing the query.
 */
export function ProcessingStepsCard({
  isLoading,
  processingSteps,
}: ProcessingStepsCardProps) {
  if (!isLoading || processingSteps.length === 0) return null;

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack gap="200" blockAlign="center">
          <Spinner size="small" />
          <Text as="h3" variant="headingMd">
            Analyzing your query
          </Text>
        </InlineStack>

        <Box paddingInlineStart="400">
          <BlockStack gap="150">
            {processingSteps.map((step, index) => (
              <Text key={index} as="p" variant="bodySm" tone="subdued">
                • {step}
              </Text>
            ))}
          </BlockStack>
        </Box>
      </BlockStack>
    </Card>
  );
}
