import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Box,
} from "@shopify/polaris";
import type { FeedbackCategoryType } from "./feedbackCategories";

interface FeedbackCategoryCardProps {
  type: FeedbackCategoryType;
  title: string;
  icon: string;
  buttonText: string;
  onClick: (type: FeedbackCategoryType) => void;
}

export function FeedbackCategoryCard({
  type,
  title,
  icon,
  buttonText,
  onClick,
}: FeedbackCategoryCardProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="200" blockAlign="center">
            <Box
              padding="150"
              borderRadius="full"
              background="bg-surface-secondary"
            >
              <Text as="span" variant="headingMd">
                {icon}
              </Text>
            </Box>
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              {title}
            </Text>
          </InlineStack>
        </InlineStack>

        <Button variant="secondary" onClick={() => onClick(type)} fullWidth>
          {buttonText}
        </Button>
      </BlockStack>
    </Card>
  );
}
