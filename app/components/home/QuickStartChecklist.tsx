import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Box,
  Icon,
  Collapsible,
} from "@shopify/polaris";
import { ChevronDownIcon, ChevronUpIcon } from "@shopify/polaris-icons";
import { QuickStartSteps } from "./quick-start-steps";

interface QuickStartChecklistProps {
  completedSteps: number[];
  autoCompletedSteps?: number[];
  onToggleStep: (stepId: number) => void;
  loadingStepId?: number | null;
}

/**
 * Quick Start Checklist Component
 *
 * Interactive onboarding checklist with progress tracking
 */
export function QuickStartChecklist({
  completedSteps,
  autoCompletedSteps = [],
  onToggleStep,
  loadingStepId = null,
}: QuickStartChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalSteps = 3;

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <div
            style={{ cursor: "pointer" }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Box
              padding="300"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <InlineStack gap="300" align="space-between" blockAlign="center">
                <InlineStack gap="300" blockAlign="center">
                  <Icon
                    source={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                    tone="base"
                  />
                  <Text as="h3" variant="headingMd" fontWeight="semibold">
                    Quick Start Guide
                  </Text>
                  <Badge tone="info">
                    {`${completedSteps.filter((id) => id <= 3).length}/${totalSteps} Completed`}
                  </Badge>
                </InlineStack>
              </InlineStack>
            </Box>
          </div>

          {isExpanded && (
            <Text variant="bodyMd" as="p" tone="subdued">
              Follow these steps to get the most out of your app
            </Text>
          )}
        </BlockStack>

        <Collapsible open={isExpanded} id="quick-start-tasks">
          <QuickStartSteps
            completedSteps={completedSteps}
            autoCompletedSteps={autoCompletedSteps}
            onToggleStep={onToggleStep}
            loadingStepId={loadingStepId}
          />
        </Collapsible>
      </BlockStack>
    </Card>
  );
}
