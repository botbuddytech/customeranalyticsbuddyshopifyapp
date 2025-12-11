import {
  Card,
  InlineStack,
  BlockStack,
} from "@shopify/polaris";

/**
 * Reusable Skeleton Loader Component for Insight Cards
 * 
 * Used across all dashboard card components (CustomersOverview and PurchaseOrderBehavior)
 * to show a loading state while data is being fetched.
 * 
 * Features:
 * - Matches the exact structure of InsightCard
 * - Shimmer animation effect for better visual feedback
 */
export function InsightCardSkeleton() {
  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }
          
          .skeleton-shimmer {
            background: linear-gradient(
              90deg,
              #f6f6f7 0%,
              #ffffff 20%,
              #f6f6f7 40%,
              #f6f6f7 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }
          
          .skeleton-shimmer-dark {
            background: linear-gradient(
              90deg,
              #e1e3e5 0%,
              #f6f6f7 20%,
              #e1e3e5 40%,
              #e1e3e5 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }
          
          .skeleton-badge {
            background: linear-gradient(
              90deg,
              #e1e3e5 0%,
              #f6f6f7 20%,
              #e1e3e5 40%,
              #e1e3e5 100%
            );
            background-size: 1000px 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 12px;
          }
        `}
      </style>
      <div style={{ height: "100%" }}>
        <Card padding="400">
          <BlockStack gap="300">
            {/* Card header skeleton - Title and Badge (matches InsightCard header) */}
            <InlineStack align="space-between">
              {/* Title skeleton */}
              <div
                className="skeleton-shimmer"
                style={{
                  width: "140px",
                  height: "22px",
                }}
              />
              {/* Badge skeleton */}
              <div
                className="skeleton-badge"
                style={{
                  width: "55px",
                  height: "22px",
                }}
              />
            </InlineStack>

            {/* Value and chart skeleton - matches InsightCard value section */}
            <InlineStack align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                {/* Large value skeleton (heading2xl size) */}
                <div
                  className="skeleton-shimmer-dark"
                  style={{
                    width: "90px",
                    height: "40px",
                  }}
                />
                {/* Mini chart skeleton (60x30px container) */}
                <div
                  className="skeleton-shimmer"
                  style={{
                    width: "60px",
                    height: "30px",
                  }}
                />
              </InlineStack>
              {/* Optional view button skeleton (for cards with showViewButton) */}
              <div
                className="skeleton-shimmer"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                }}
              />
            </InlineStack>

            {/* Description and Growth indicator skeleton */}
            <BlockStack gap="100">
              {/* Description line */}
              <div
                className="skeleton-shimmer"
                style={{
                  width: "100%",
                  maxWidth: "280px",
                  height: "18px",
                }}
              />
              {/* Growth indicator line (shorter) */}
              <div
                className="skeleton-shimmer"
                style={{
                  width: "200px",
                  height: "18px",
                }}
              />
            </BlockStack>
          </BlockStack>
        </Card>
      </div>
    </>
  );
}
