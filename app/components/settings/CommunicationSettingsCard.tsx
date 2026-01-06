import {
  Card,
  BlockStack,
  Text,
  InlineStack,
  FormLayout,
  Button,
  Divider,
} from "@shopify/polaris";

interface CommunicationSettingsCardProps {
  whatsappNumber: string;
  emailId: string;
  onConfigureWhatsApp: () => void;
  onConfigureEmail: () => void;
}

/**
 * Communication Settings Card Component
 *
 * Displays WhatsApp and Email configuration options
 */
export function CommunicationSettingsCard({
  // whatsappNumber,
  emailId,
  // onConfigureWhatsApp,
  onConfigureEmail,
}: CommunicationSettingsCardProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          📱 Communication
        </Text>

        <FormLayout>
          {/* WhatsApp Setting */}
          {/* <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="050">
              <Text as="p" variant="bodyMd" fontWeight="medium">
                WhatsApp Number
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {whatsappNumber || "Not configured"}
              </Text>
            </BlockStack>
            <Button size="slim" onClick={onConfigureWhatsApp}>
              Configure
            </Button>
          </InlineStack> */}

          {/* <Divider /> */}

          {/* Email Setting */}
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="050">
              <Text as="p" variant="bodyMd" fontWeight="medium">
                Email Address
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {emailId || "Not configured"}
              </Text>
            </BlockStack>
            <Button size="slim" onClick={onConfigureEmail}>
              Configure
            </Button>
          </InlineStack>
        </FormLayout>
      </BlockStack>
    </Card>
  );
}
