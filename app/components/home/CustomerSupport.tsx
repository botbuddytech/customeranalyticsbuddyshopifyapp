import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Box,
  Divider,
} from "@shopify/polaris";

/**
 * Customer Support Component
 *
 * Displays help and support contact options with a professional Shopify-style design
 */
export function CustomerSupport() {
  return (
    <Card>
      <BlockStack gap="400">
        {/* Header Section */}
        <BlockStack gap="100">
          <Text as="h3" variant="headingMd">
            Customer Support
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Get help when you need it. We&apos;re here to assist you.
          </Text>
        </BlockStack>

        <Divider />

        {/* Support Options */}
        <BlockStack gap="300">
          <Box
            padding="300"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <InlineStack align="space-between" blockAlign="center" wrap={false}>
              <BlockStack gap="050">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  📚 Documentation
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Browse guides and tutorials
                </Text>
              </BlockStack>
              <Button
                variant="secondary"
                url="https://docs.audienceinsight.com"
                external
              >
                View Docs
              </Button>
            </InlineStack>
          </Box>

          <Box
            padding="300"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <InlineStack align="space-between" blockAlign="center" wrap={false}>
              <BlockStack gap="050">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  🎧 Customer Care
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Reach out to our support team
                </Text>
              </BlockStack>
              <Button
                variant="secondary"
                url="mailto:care@audienceinsight.com"
                external
              >
                Contact Us
              </Button>
            </InlineStack>
          </Box>

          <Box
            padding="300"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <InlineStack align="space-between" blockAlign="center" wrap={false}>
              <BlockStack gap="050">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  🤖 Live Chat
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Get instant help from our team
                </Text>
              </BlockStack>
              <Button
                variant="secondary"
                onClick={() => {
                  alert(
                    "Opening live chat... (integrate with your chat service like Intercom, Crisp, or Zendesk)",
                  );
                }}
              >
                Start Chat
              </Button>
            </InlineStack>
          </Box>

          {/* <Box
            padding="300"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <InlineStack align="space-between" blockAlign="center" wrap={false}>
              <BlockStack gap="050">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  👥 Community
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Connect with other merchants
                </Text>
              </BlockStack>
              <Button
                variant="secondary"
                url="https://community.audienceinsight.com"
                external
              >
                Join Now
              </Button>
            </InlineStack>
          </Box> */}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
