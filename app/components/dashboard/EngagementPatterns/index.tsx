import { Layout, BlockStack, Text, Grid } from "@shopify/polaris";
import { DiscountUsers } from "./DiscountUsers/DiscountUsers";
import { WishlistUsers } from "./WishlistUsers/WishlistUsers";
import { Reviewers } from "./Reviewers/Reviewers";
import { EmailSubscribers } from "./EmailSubscribers/EmailSubscribers";

interface EngagementPatternsProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
  visibility?: {
    discountUsers?: boolean;
    wishlistUsers?: boolean;
    reviewers?: boolean;
    emailSubscribers?: boolean;
  };
}

/**
 * Engagement Patterns Section Component
 * 
 * Main component that renders all engagement metric cards.
 * Each card component fetches its own data independently.
 */
export function EngagementPatterns({
  dateRange = "30days",
  onViewSegment,
  visibility,
}: EngagementPatternsProps) {
  // Default to showing all if visibility is not provided
  const showDiscountUsers = visibility?.discountUsers !== false;
  const showWishlistUsers = visibility?.wishlistUsers !== false;
  const showReviewers = visibility?.reviewers !== false;
  const showEmailSubscribers = visibility?.emailSubscribers !== false;

  // Don't render section if no cards are visible
  if (
    !showDiscountUsers &&
    !showWishlistUsers &&
    !showReviewers &&
    !showEmailSubscribers
  ) {
    return null;
  }

  return (
    <Layout.Section>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Engagement Patterns
        </Text>
        <Grid>
          {showDiscountUsers && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <DiscountUsers
                dateRange={dateRange}
                onViewSegment={onViewSegment}
              />
            </Grid.Cell>
          )}

          {showWishlistUsers && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <WishlistUsers
                dateRange={dateRange}
                onViewSegment={onViewSegment}
              />
            </Grid.Cell>
          )}

          {showReviewers && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <Reviewers dateRange={dateRange} onViewSegment={onViewSegment} />
            </Grid.Cell>
          )}

          {showEmailSubscribers && (
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <EmailSubscribers
                dateRange={dateRange}
                onViewSegment={onViewSegment}
              />
            </Grid.Cell>
          )}
        </Grid>
      </BlockStack>
    </Layout.Section>
  );
}

