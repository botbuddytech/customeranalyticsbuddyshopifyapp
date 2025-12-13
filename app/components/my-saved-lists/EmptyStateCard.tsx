import { Card, EmptyState } from "@shopify/polaris";

interface EmptyStateCardProps {
  searchQuery: string;
}

/**
 * Empty State Card Component
 * 
 * Displays when no saved lists are found
 */
export function EmptyStateCard({ searchQuery }: EmptyStateCardProps) {
  return (
    <Card>
      <EmptyState
        heading="No saved lists found"
        action={{
          content: "Create your first list",
          url: "/app/ai-search-analyzer",
        }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>
          {searchQuery
            ? `No lists match "${searchQuery}". Try different search terms.`
            : "Create customer segments using AI Search or Filter Audience tools."}
        </p>
      </EmptyState>
    </Card>
  );
}

