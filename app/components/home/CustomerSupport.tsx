import { Card, BlockStack, Text, Button } from "@shopify/polaris";

/**
 * Customer Support Component
 * 
 * Displays help and support contact options
 */
export function CustomerSupport() {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          Need Help?
        </Text>

        <BlockStack gap="200">
          <Button variant="plain" url="https://docs.audienceinsight.com" external>
            📚 View Documentation
          </Button>

          <Button variant="plain" url="mailto:care@audienceinsight.com" external>
            🎧 Customer Care Team
          </Button>

          <Button
            variant="plain"
            onClick={() => {
              alert('Opening live chat... (integrate with your chat service like Intercom, Crisp, or Zendesk)');
            }}
          >
            🤖 Live Chat Support
          </Button>

          <Button variant="plain" url="https://community.audienceinsight.com" external>
            👥 Join Community
          </Button>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
