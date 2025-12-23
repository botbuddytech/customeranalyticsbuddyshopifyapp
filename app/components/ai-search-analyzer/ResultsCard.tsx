import {
  BlockStack,
  Card,
  InlineStack,
  Text,
  Badge,
  Banner,
  DataTable,
  Button,
  Box,
} from "@shopify/polaris";
import { SaveIcon, ExportIcon } from "@shopify/polaris-icons";

interface ResultsCardProps {
  hasResults: boolean;
  explanation: string;
  rowCount: number;
  tableRows: (string | number)[][];
}

/**
 * Results Card
 *
 * Displays the search results with customer data table and actions.
 */
export function ResultsCard({
  hasResults,
  explanation,
  rowCount,
  tableRows,
}: ResultsCardProps) {
  if (!hasResults) return null;

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingLg">
            Search results
          </Text>
          <Badge tone="success">{`${rowCount} found`}</Badge>
        </InlineStack>

        {explanation && (
          <Banner tone="info">
            <p>{explanation}</p>
          </Banner>
        )}

        <DataTable
          columnContentTypes={["text", "text", "text", "text", "numeric"]}
          headings={["Name", "Email", "Last Purchase", "Total Spent", "Orders"]}
          rows={tableRows}
        />

        <Box paddingBlockStart="200">
          <InlineStack align="end" gap="200">
            <Button icon={SaveIcon} variant="secondary">
              Save segment
            </Button>
            <Button icon={ExportIcon} variant="primary">
              Export
            </Button>
          </InlineStack>
        </Box>
      </BlockStack>
    </Card>
  );
}
