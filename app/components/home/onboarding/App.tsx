import React, { useState, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";
import ProgressBar from "./ProgressBar";
import Navigation from "./Navigation";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import { Toast } from "@shopify/polaris";

interface PlanWithBenefits {
  id: string;
  code: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  badgeTone: string | null;
  badgeLabel: string | null;
  primaryCtaLabel: string;
  primaryCtaVariant: string;
  isCurrentDefault: boolean;
  benefits: {
    id: string;
    planId: string;
    sortOrder: number;
    label: string;
  }[];
}

interface OnboardingAppProps {
  initialStep?: number;
  nextStep?: number;
  completedSteps?: number[];
  isCompleted?: boolean;
  shop?: string;
  plans?: PlanWithBenefits[];
  currentPlan?: string | null;
  onComplete?: () => void;
}

const App: React.FC<OnboardingAppProps> = ({
  initialStep = 1,
  nextStep: nextStepProp,
  completedSteps = [],
  isCompleted = false,
  shop,
  plans = [],
  currentPlan = null,
  onComplete,
}) => {

  // Calculate the step to resume from based on completed steps
  const calculateResumeStep = useCallback((): number => {
    if (nextStepProp) {
      return nextStepProp;
    }
    if (isCompleted && completedSteps.length >= 4) {
      return 5;
    }
    // Find the first incomplete step
    for (let step = 1; step <= 4; step++) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }
    // All steps completed
    return 5;
  }, [nextStepProp, isCompleted, completedSteps]);

  const [currentStep, setCurrentStep] = useState(() =>
    calculateResumeStep(),
  );
  const [isFinishing, setIsFinishing] = useState(false);
  const [localCompletedSteps, setLocalCompletedSteps] =
    useState<number[]>(completedSteps);
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);
  const fetcher = useFetcher();
  const totalSteps = 4;

  // Trigger completion callback when onboarding is completed (only once)
  useEffect(() => {
    if (
      currentStep === 5 &&
      localCompletedSteps.length >= totalSteps &&
      onComplete &&
      !hasTriggeredCompletion
    ) {
      setHasTriggeredCompletion(true);
      onComplete();
    }
  }, [currentStep, localCompletedSteps.length, totalSteps, onComplete, hasTriggeredCompletion]);

  // Update current step only on initial load or when onboarding is completed
  useEffect(() => {
    // Only update step on initial mount or when all steps are completed
    if (isCompleted && localCompletedSteps.length >= totalSteps && currentStep !== 5) {
      setCurrentStep(5);
    }
    // Update local completed steps when props change (only if different to prevent loops)
    if (JSON.stringify(completedSteps) !== JSON.stringify(localCompletedSteps)) {
      setLocalCompletedSteps(completedSteps);
    }
  }, [isCompleted, completedSteps, totalSteps, currentStep, localCompletedSteps]);

  const saveProgress = useCallback(async (step: number) => {
    if (!shop) return;

    const newCompletedSteps = [
      ...new Set([...localCompletedSteps, step]),
    ].sort((a, b) => a - b);

    setLocalCompletedSteps(newCompletedSteps);

    fetcher.submit(
      {
        intent: "saveOnboardingProgress",
        step: step.toString(),
        completedSteps: JSON.stringify(newCompletedSteps),
      },
      { method: "POST", encType: "application/json" },
    );
  }, [shop, localCompletedSteps, fetcher]);

  const nextStep = () => {
    // Update local state immediately to prevent reset
    if (currentStep <= totalSteps) {
      const newCompletedSteps = [
        ...new Set([...localCompletedSteps, currentStep]),
      ].sort((a, b) => a - b);
      setLocalCompletedSteps(newCompletedSteps);
      
      // Save to database (async, but we've already updated local state)
      saveProgress(currentStep);
    }

    // Move to next step immediately
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === totalSteps) {
      // All steps completed, show completion step
      setCurrentStep(5);
    } else {
      setIsFinishing(true);
      setTimeout(() => {
        setIsFinishing(false);
      }, 1500);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            onComplete={nextStep}
            onTaskComplete={() => saveProgress(1)}
            isCompleted={localCompletedSteps.includes(1)}
          />
        );
      case 2:
        return (
          <Step2
            onComplete={nextStep}
            onTaskComplete={() => saveProgress(2)}
            plans={plans}
            currentPlan={currentPlan}
          />
        );
      case 3:
        return (
          <Step3
            onComplete={nextStep}
            onTaskComplete={() => saveProgress(3)}
            shop={shop}
          />
        );
      case 4:
        return (
          <Step4
            onComplete={nextStep}
            onTaskComplete={() => saveProgress(4)}
          />
        );
      case 5:
        return <Step5 onComplete={nextStep} />;
      default:
        return (
          <Step1
            onComplete={nextStep}
            onTaskComplete={() => saveProgress(1)}
          />
        );
    }
  };

  return (
    <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#F6F6F7",
        }}
      >
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "24px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "896px",
            backgroundColor: "white",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            marginBottom: "48px",
            position: "relative",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {isFinishing && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(4px)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  border: "4px solid #008060",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  marginBottom: "16px",
                }}
              ></div>
              <p style={{ fontWeight: "bold", fontSize: "18px" }}>
                Setting up your store...
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div
            style={{
              borderBottom: "1px solid #E1E3E5",
              backgroundColor: "white",
              paddingLeft: "24px",
              paddingRight: "24px",
              paddingTop: "40px",
              paddingBottom: "40px",
            }}
          >
            <ProgressBar currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <div
            style={{
              padding: "48px",
              minHeight: "500px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div key={currentStep} style={{ flexGrow: 1, height: "100%" }}>
              {renderStep()}
            </div>
          </div>

          {/* Footer Controls */}
          {currentStep <= totalSteps && (
            <div
              style={{
                borderTop: "1px solid #E1E3E5",
                backgroundColor: "#F9FAFB",
                paddingLeft: "32px",
                paddingRight: "32px",
                paddingTop: "20px",
                paddingBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Navigation
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={nextStep}
                onPrev={prevStep}
              />
            </div>
          )}
        </div>

        {/* Visual Progress Dots */}
        {currentStep <= totalSteps && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  height: "8px",
                  borderRadius: "9999px",
                  transition: "all 0.3s",
                  width: currentStep === s ? "24px" : "8px",
                  backgroundColor:
                    currentStep === s || localCompletedSteps.includes(s)
                      ? "#008060"
                      : "#D1D5DB",
                }}
              />
            ))}
          </div>
        )}
      </main>

      <footer
        style={{
          textAlign: "center",
          paddingTop: "24px",
          paddingBottom: "24px",
          fontSize: "14px",
          color: "#9CA3AF",
          borderTop: "1px solid #F3F4F6",
          backgroundColor: "white",
        }}
      >
        &copy; {new Date().getFullYear()} Customer Analytics Buddy. Powered by
        Shopify Data Engine.
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
