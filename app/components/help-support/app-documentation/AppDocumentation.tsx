import { Card, BlockStack, Text, Link } from "@shopify/polaris";
import { DOCUMENTATION_URL } from "../constants";

/**
 * App Documentation Component
 * 
 * Displays documentation link and description
 */
export function AppDocumentation() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          App Documentation
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          Complete documentation and guides
        </Text>
        <Link url={DOCUMENTATION_URL} removeUnderline external>
          View full documentation
        </Link>
      </BlockStack>
    </Card>
  );
}

