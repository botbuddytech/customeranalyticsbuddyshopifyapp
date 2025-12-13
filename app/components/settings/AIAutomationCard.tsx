import { Card, BlockStack, Text, InlineStack, FormLayout, Checkbox, Button, Divider } from "@shopify/polaris";

interface AIAutomationCardProps {
  aiSuggestions: boolean;
  aiAudienceAnalysis: boolean;
  reportFrequency: string;
  reportDay: string;
  reportTime: string;
  onToggleAISuggestions: (value: boolean) => void;
  onToggleAIAudienceAnalysis: (value: boolean) => void;
  onConfigureSchedule: () => void;
}

/**
 * AI & Automation Settings Card Component
 * 
 * Displays AI suggestions and report schedule configuration
 */
export function AIAutomationCard({
  aiSuggestions,
  aiAudienceAnalysis,
  reportFrequency,
  reportDay,
  reportTime,
  onToggleAISuggestions,
  onToggleAIAudienceAnalysis,
  onConfigureSchedule,
}: AIAutomationCardProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          🤖 AI & Automation
        </Text>

        <FormLayout>
          {/* AI Suggestions */}
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="050">
              <Text as="p" variant="bodyMd" fontWeight="medium">
                AI Campaign Suggestions
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Get intelligent recommendations
              </Text>
            </BlockStack>
            <Checkbox
              label=""
              labelHidden
              checked={aiSuggestions}
              onChange={onToggleAISuggestions}
            />
          </InlineStack>

          <Divider />

          {/* AI Audience Analysis */}
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="050">
              <Text as="p" variant="bodyMd" fontWeight="medium">
                AI Audience Analysis Suggestion
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Get intelligent audience insights
              </Text>
            </BlockStack>
            <Checkbox
              label=""
              labelHidden
              checked={aiAudienceAnalysis}
              onChange={onToggleAIAudienceAnalysis}
            />
          </InlineStack>

          <Divider />

          {/* Report Schedule */}
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="050">
              <Text as="p" variant="bodyMd" fontWeight="medium">
                Automated Reports
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {reportFrequency} on {reportDay}s at {reportTime}
              </Text>
            </BlockStack>
            <Button size="slim" onClick={onConfigureSchedule}>
              Schedule
            </Button>
          </InlineStack>
        </FormLayout>
      </BlockStack>
    </Card>
  );
}

