import { BlockStack } from "@shopify/polaris";
import { Step1AISegment } from "./step-1-ai-segment";
import { Step2FilterAudience } from "./step-2-filter-audience";
import { Step3Campaign } from "./step-3-campaign";

interface QuickStartStepsProps {
  completedSteps: number[];
  autoCompletedSteps?: number[];
  onToggleStep: (stepId: number) => void;
  loadingStepId?: number | null;
}

/**
 * Quick Start Steps Component
 * 
 * Compiles all three quick start steps into a single component
 */
export function QuickStartSteps({
  completedSteps,
  autoCompletedSteps = [],
  onToggleStep,
  loadingStepId = null,
}: QuickStartStepsProps) {
  const step1Completed = completedSteps.includes(1);
  const step2Completed = completedSteps.includes(2);
  const step3Completed = completedSteps.includes(3);

  const step1AutoCompleted = autoCompletedSteps.includes(1);
  const step2AutoCompleted = autoCompletedSteps.includes(2);
  const step3AutoCompleted = autoCompletedSteps.includes(3);

  const step1CanUndo = step1Completed && !step1AutoCompleted;
  const step2CanUndo = step2Completed && !step2AutoCompleted;
  const step3CanUndo = step3Completed && !step3AutoCompleted;

  return (
    <BlockStack gap="300">
      <Step1AISegment
        isCompleted={step1Completed}
        isAutoCompleted={step1AutoCompleted}
      />

      <Step2FilterAudience
        isCompleted={step2Completed}
        isAutoCompleted={step2AutoCompleted}
      />

      <Step3Campaign
        isCompleted={step3Completed}
        isAutoCompleted={step3AutoCompleted}
      />
    </BlockStack>
  );
}

