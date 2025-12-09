import { Card, BlockStack, InlineStack, Text, Badge, Box, Button, Icon } from "@shopify/polaris";
import { CheckIcon, PersonIcon, FilterIcon, ViewIcon } from "@shopify/polaris-icons";

interface QuickStartChecklistProps {
  completedSteps: number[];
  onToggleStep: (stepId: number) => void;
  loadingStepId?: number | null;
}

/**
 * Quick Start Checklist Component
 * 
 * Interactive onboarding checklist with progress tracking
 */
export function QuickStartChecklist({ completedSteps, onToggleStep, loadingStepId = null }: QuickStartChecklistProps) {
  const quickStartSteps = [
    {
      id: 1,
      title: "Use AI to generate your first customer segment",
      description: "Let AI analyze your customers and create smart segments",
      icon: PersonIcon,
    },
    {
      id: 2,
      title: "Filter customers manually using 20+ audience traits",
      description: "Create precise segments with advanced filtering options",
      icon: FilterIcon,
    },
    {
      id: 3,
      title: "Send your first WhatsApp or Email campaign",
      description: "Engage your segments with targeted messaging",
      icon: ViewIcon,
    },
  ];

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <InlineStack gap="200" align="space-between">
            <Text as="h3" variant="headingMd">
              Quick Start Guide
            </Text>

            <Badge tone="info">
              {`${completedSteps.length}/${quickStartSteps.length} Completed`}
            </Badge>
          </InlineStack>

          <Text variant="bodyMd" as="p" tone="subdued">
            Follow these steps to get the most out of your app
          </Text>
        </BlockStack>

        <BlockStack gap="300">
          {quickStartSteps.map((step) => (
            <Box
              key={step.id}
              padding="400"
              background={completedSteps.includes(step.id) ? "bg-surface-success" : "bg-surface"}
              borderRadius="200"
              borderWidth="025"
              borderColor={completedSteps.includes(step.id) ? "border-success" : "border"}
            >
              <InlineStack gap="300" align="space-between">
                <InlineStack gap="300" align="start">
                  <Icon
                    source={completedSteps.includes(step.id) ? CheckIcon : step.icon}
                    tone={completedSteps.includes(step.id) ? "success" : "base"}
                  />

                  <BlockStack gap="100">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {step.title}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {step.description}
                    </Text>
                  </BlockStack>
                </InlineStack>

                <Button
                  variant="plain"
                  onClick={() => onToggleStep(step.id)}
                  loading={loadingStepId === step.id}
                  disabled={loadingStepId === step.id}
                  accessibilityLabel={`Mark step ${step.id} as ${completedSteps.includes(step.id) ? 'incomplete' : 'complete'}`}
                >
                  {completedSteps.includes(step.id) ? "Undo" : "Mark Complete"}
                </Button>
              </InlineStack>
            </Box>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
