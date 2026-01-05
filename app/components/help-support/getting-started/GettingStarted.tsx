import { Card, BlockStack, Text, List, Link } from "@shopify/polaris";
import { GETTING_STARTED_ITEMS } from "./gettingStartedConfig";

/**
 * Getting Started Component
 * 
 * Displays a list of getting started items with links
 * Items are configured in gettingStartedConfig.ts
 */
export function GettingStarted() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Getting Started
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          New to Customer Analytics Buddy? Start here to learn the basics.
        </Text>
        
        <List type="bullet">
          {GETTING_STARTED_ITEMS.map((item, index) => (
            <List.Item key={index}>
              <Link url={item.link} removeUnderline external>
                {item.name}
              </Link>
            </List.Item>
          ))}
        </List>
      </BlockStack>
    </Card>
  );
}

