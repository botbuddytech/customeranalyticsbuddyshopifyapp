import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import Navigation from "./Navigation";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import { Card } from "@shopify/polaris";

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinishing(true);
      setTimeout(() => {
        alert("🎉 Welcome aboard! Your dashboard is being prepared.");
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
        return <Step1 onComplete={nextStep} />;
      case 2:
        return <Step2 onComplete={nextStep} />;
      case 3:
        return <Step3 onComplete={nextStep} />;
      case 4:
        return <Step4 onComplete={nextStep} />;
      default:
        return <Step1 onComplete={nextStep} />;
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
        </div>

        {/* Visual Progress Dots */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                height: "8px",
                borderRadius: "9999px",
                transition: "all 0.3s",
                width: currentStep === s ? "24px" : "8px",
                backgroundColor: currentStep === s ? "#008060" : "#D1D5DB",
              }}
            />
          ))}
        </div>
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
