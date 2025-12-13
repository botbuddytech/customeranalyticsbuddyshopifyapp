import { Card, BlockStack, Text, Button } from "@shopify/polaris";
import { ExportIcon, EmailIcon } from "@shopify/polaris-icons";

interface QuickActionsProps {
  hasResults: boolean;
  onExportSegment?: () => void;
  onCreateCampaign?: () => void;
  onSaveToList?: () => void;
}

export function QuickActions({
  hasResults,
  onExportSegment,
  onCreateCampaign,
  onSaveToList,
}: QuickActionsProps) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          ⚡ Quick Actions
        </Text>

        <BlockStack gap="200">
          <Button
            variant="secondary"
            fullWidth
            icon={ExportIcon}
            disabled={!hasResults}
            onClick={onExportSegment}
          >
            Export Segment
          </Button>

          <Button
            variant="secondary"
            fullWidth
            icon={EmailIcon}
            disabled={!hasResults}
            onClick={onCreateCampaign}
          >
            Create Campaign
          </Button>

          <Button
            variant="secondary"
            fullWidth
            disabled={!hasResults}
            onClick={onSaveToList}
          >
            Save to Lists
          </Button>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

