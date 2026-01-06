import { Modal, BlockStack, Text, Button, Link } from "@shopify/polaris";

interface ProtectedDataAccessModalProps {
  open: boolean;
  onClose: () => void;
  dataType: "customer" | "order" | "both";
  featureName: string;
}

/**
 * Protected Data Access Modal Component
 *
 * Reusable modal component that displays instructions for requesting
 * protected customer/order data access from Shopify Partner Dashboard.
 */
export function ProtectedDataAccessModal({
  open,
  onClose,
  dataType,
  featureName,
}: ProtectedDataAccessModalProps) {
  const getTitle = () => {
    if (dataType === "customer") {
      return "Protected Customer Data Access Required";
    } else if (dataType === "order") {
      return "Protected Order Data Access Required";
    } else {
      return "Protected Data Access Required";
    }
  };

  const getDescription = () => {
    if (dataType === "customer") {
      return `This app requires access to protected customer data to display ${featureName} information.`;
    } else if (dataType === "order") {
      return `This app requires access to protected order data to display ${featureName} information.`;
    } else {
      return `This app requires access to protected customer and order data to display ${featureName} information.`;
    }
  };

  const getDevelopmentStoreNote = () => {
    if (dataType === "customer") {
      return "For development stores, you can access customer data immediately after selecting the data in the Partner Dashboard without waiting for review.";
    } else if (dataType === "order") {
      return "For development stores, you can access order data immediately after selecting the data in the Partner Dashboard without waiting for review.";
    } else {
      return "For development stores, you can access customer and order data immediately after selecting the data in the Partner Dashboard without waiting for review.";
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={getTitle()}
      primaryAction={{
        content: "Close",
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            {getDescription()}
          </Text>
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              To enable this feature:
            </Text>
            <BlockStack gap="100">
              <Text as="p" variant="bodySm">
                1. Go to your{" "}
                <Link url="https://partners.shopify.com" external>
                  Shopify Partner Dashboard
                </Link>
              </Text>
              <Text as="p" variant="bodySm">
                2. Navigate to <strong>Apps</strong> → Select your app
              </Text>
              <Text as="p" variant="bodySm">
                3. Click <strong>API access requests</strong> in the sidebar
              </Text>
              <Text as="p" variant="bodySm">
                4. Find <strong>Protected customer data access</strong> and click{" "}
                <strong>Request access</strong>
              </Text>
              <Text as="p" variant="bodySm">
                5. Select <strong>Protected customer data</strong> and provide your
                reasons
              </Text>
              <Text as="p" variant="bodySm">
                6. Complete your <strong>Data protection details</strong>
              </Text>
              <Text as="p" variant="bodySm">
                7. Submit your app for review (or test in development stores)
              </Text>
            </BlockStack>
          </BlockStack>
          <Text as="p" variant="bodySm" tone="subdued">
            {getDevelopmentStoreNote()}
          </Text>
          <Text as="p" variant="bodySm">
            Learn more:{" "}
            <Link
              url="https://shopify.dev/docs/apps/launch/protected-customer-data"
              external
            >
              Protected Customer Data Documentation
            </Link>
          </Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

