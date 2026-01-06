import { Card, BlockStack, Text, List, Link } from "@shopify/polaris";
import { TUTORIAL_ITEMS } from "./videosTutorialsConfig";

/**
 * Videos & Tutorials Component
 * 
 * Displays a list of tutorial links (clickable but no navigation)
 */
export function VideosTutorials() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          Videos & Tutorials
        </Text>
        <List type="bullet">
          {TUTORIAL_ITEMS.map((tutorial, index) => (
            <List.Item key={index}>
              <Link url="#" removeUnderline onClick={(e) => e.preventDefault()}>
                {tutorial.name}
              </Link>
            </List.Item>
          ))}
        </List>
      </BlockStack>
    </Card>
  );
}

