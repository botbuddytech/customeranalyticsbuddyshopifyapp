import React from "react";
import { KlaviyoIntegrationCard } from "./integration/KlaviyoIntegrationCard";
import { MailchimpIntegrationCard } from "./integration/MailchimpIntegrationCard";
import { SendGridIntegrationCard } from "./integration/SendGridIntegrationCard";

interface Step4Props {
  onComplete: () => void;
  onTaskComplete?: () => void;
}

const Step4: React.FC<Step4Props> = ({ onComplete, onTaskComplete }) => {
  const handleFinish = () => {
    // Mark step as completed
    if (onTaskComplete) {
      onTaskComplete();
    }
    onComplete();
  };

  return (
    <div style={{ paddingTop: "8px", paddingBottom: "8px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2
          style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}
        >
          Email Service Integrations
        </h2>
        <p style={{ color: "#4B5563", marginBottom: "8px" }}>
          Connect your email platform to sync high-performing customer segments.
        </p>
        <p style={{ color: "#6B7280", fontSize: "14px" }}>
          You can connect these services later in Settings.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <KlaviyoIntegrationCard
          selected=""
          onSelect={() => {}} // Disabled - no action
          disabled={true}
        />
        <MailchimpIntegrationCard
          selected=""
          onSelect={() => {}} // Disabled - no action
          disabled={true}
        />
        <SendGridIntegrationCard
          selected=""
          onSelect={() => {}} // Disabled - no action
          disabled={true}
        />
      </div>

      <div
        style={{
          maxWidth: "448px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <button
          onClick={handleFinish}
          style={{
            width: "100%",
            fontWeight: "700",
            padding: "12px",
            borderRadius: "6px",
            transition: "all 0.2s",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#008060",
            color: "white",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#006e52";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#008060";
          }}
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default Step4;
