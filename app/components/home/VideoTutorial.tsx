import { Card, BlockStack, InlineStack, Text, Icon, Box } from "@shopify/polaris";
import { PlayIcon } from "@shopify/polaris-icons";

/**
 * Video Tutorial Component
 * 
 * Displays an embedded YouTube tutorial video with description
 */
export function VideoTutorial() {
  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <InlineStack gap="200" align="center">
            <Icon source={PlayIcon} tone="emphasis" />
            <Text as="h3" variant="headingMd">
              Watch: Complete Setup & First Campaign Tutorial
            </Text>
          </InlineStack>

          <Text variant="bodyMd" as="p" tone="subdued">
            Learn how to set up your first AI-powered customer segment and send targeted campaigns in under 10 minutes. This step-by-step guide covers everything from connecting your store to launching your first WhatsApp or email campaign.
          </Text>
        </BlockStack>

        <Box
          padding="400"
          background="bg-surface-secondary"
          borderRadius="200"
          borderWidth="025"
          borderColor="border"
        >
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
            borderRadius: '8px'
          }}>
            <iframe
              src="https://www.youtube.com/embed/xNUx-rMGvvw"
              title="Complete Setup & First Campaign Tutorial"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allowFullScreen
            />
          </div>
        </Box>
      </BlockStack>
    </Card>
  );
}
