import { BlockStack, Card, TextField, Button, Box } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";

interface SearchQueryCardProps {
  query: string;
  isLoading: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
}

/**
 * Search Query Card
 *
 * Main input component for entering natural language queries.
 */
export function SearchQueryCard({
  query,
  isLoading,
  onQueryChange,
  onSubmit,
}: SearchQueryCardProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <TextField
          label="Ask about your customers"
          value={query}
          onChange={onQueryChange}
          placeholder="Example: Which customers haven't ordered in the last 90 days?"
          autoComplete="off"
          multiline={3}
          showCharacterCount
          maxLength={200}
          disabled={isLoading}
        />

        <Box paddingBlockStart="200">
          <Button
            variant="primary"
            icon={SearchIcon}
            onClick={onSubmit}
            loading={isLoading}
            disabled={isLoading || !query.trim()}
            size="large"
            fullWidth
          >
            Search customers
          </Button>
        </Box>
      </BlockStack>
    </Card>
  );
}
