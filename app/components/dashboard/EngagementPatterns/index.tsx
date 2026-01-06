import { Layout, BlockStack, Text, InlineGrid } from "@shopify/polaris";
import { DiscountUsers } from "./DiscountUsers/DiscountUsers";
import { WishlistUsers } from "./WishlistUsers/WishlistUsers";
import { Reviewers } from "./Reviewers/Reviewers";
import { EmailSubscribers } from "./EmailSubscribers/EmailSubscribers";

interface EngagementPatternsProps {
  dateRange?: string;
  onViewSegment?: (segmentName: string) => void;
  onShowToast?: (message: string) => void;
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
  onShowToast,
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
        <InlineGrid columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }} gap={{ xs: "400", sm: "400", md: "400", lg: "400", xl: "400" }}>
          {showDiscountUsers && (
            <DiscountUsers
              dateRange={dateRange}
              onViewSegment={onViewSegment}
              onShowToast={onShowToast}
            />
          )}

          {showWishlistUsers && (
            <WishlistUsers
              dateRange={dateRange}
              onViewSegment={onViewSegment}
              onShowToast={onShowToast}
            />
          )}

          {showReviewers && (
            <Reviewers 
              dateRange={dateRange} 
              onViewSegment={onViewSegment}
              onShowToast={onShowToast}
            />
          )}

          {showEmailSubscribers && (
            <EmailSubscribers
              dateRange={dateRange}
              onViewSegment={onViewSegment}
              onShowToast={onShowToast}
            />
          )}
        </InlineGrid>
      </BlockStack>
    </Layout.Section>
  );
}