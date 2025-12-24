import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Box,
  Button,
  Icon,
  Collapsible,
} from "@shopify/polaris";
import {
  CheckIcon,
  PersonIcon,
  FilterIcon,
  ViewIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@shopify/polaris-icons";

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

  const quickStartSteps = [
    {
      id: 1,
      title: "Use AI to generate your first customer segment",
      description: "Let AI analyze your customers and create smart segments",
      icon: PersonIcon,
    },
    {
      id: 2,
      title: "Filter customers manually using 2+ audience traits",
      description: "Create precise segments with advanced filtering options",
      icon: FilterIcon,
    },
    {
      id: 3,
      title: "Send your first WhatsApp or Email campaign",
      description: "Engage your segments with targeted messaging",
      icon: ViewIcon,
    },
    {
      id: 4,
      title: "First list saved",
      description: "Save your first customer segment list",
      icon: ViewIcon,
    },
  ];

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
                    {`${completedSteps.length}/${quickStartSteps.length} Completed`}
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
          <BlockStack gap="300">
            {quickStartSteps.map((step) => {
              const isCompleted = completedSteps.includes(step.id);
              const isAutoCompleted = autoCompletedSteps.includes(step.id);
              const canUndo = isCompleted && !isAutoCompleted;

              return (
                <Box
                  key={step.id}
                  padding="400"
                  background={isCompleted ? "bg-surface-success" : "bg-surface"}
                  borderRadius="200"
                  borderWidth="025"
                  borderColor={isCompleted ? "border-success" : "border"}
                >
                  <InlineStack gap="300" align="space-between">
                    <InlineStack gap="300" align="start">
                      <Icon
                        source={isCompleted ? CheckIcon : step.icon}
                        tone={isCompleted ? "success" : "base"}
                      />

                      <BlockStack gap="100">
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          {step.title}
                        </Text>
                        <Text as="p" variant="bodySm" tone="subdued">
                          {step.description}
                          {isAutoCompleted && (
                            <Text as="span" tone="success" fontWeight="medium">
                              {" "}
                              (Auto-completed)
                            </Text>
                          )}
                        </Text>
                      </BlockStack>
                    </InlineStack>

                    <Button
                      variant="plain"
                      onClick={() => onToggleStep(step.id)}
                      loading={loadingStepId === step.id}
                      disabled={
                        loadingStepId === step.id ||
                        (isCompleted && isAutoCompleted)
                      }
                      accessibilityLabel={`Mark step ${step.id} as ${isCompleted ? "incomplete" : "complete"}`}
                    >
                      {isCompleted && isAutoCompleted
                        ? "Auto-completed"
                        : isCompleted
                          ? "Undo"
                          : "Mark Complete"}
                    </Button>
                  </InlineStack>
                </Box>
              );
            })}
          </BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}
