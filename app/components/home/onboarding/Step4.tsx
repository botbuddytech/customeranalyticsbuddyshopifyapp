import React, { useState } from "react";
import { KlaviyoIntegrationCard } from "./integration/KlaviyoIntegrationCard";
import { MailchimpIntegrationCard } from "./integration/MailchimpIntegrationCard";
import { SendGridIntegrationCard } from "./integration/SendGridIntegrationCard";

interface Step4Props {
  onComplete: () => void;
  onTaskComplete?: () => void;
}

const Step4: React.FC<Step4Props> = ({ onComplete, onTaskComplete }) => {
  const [selected, setSelected] = useState("");

  return (
    <div style={{ paddingTop: "8px", paddingBottom: "8px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
          Connect Email Service
        </h2>
        <p style={{ color: "#4B5563" }}>
          Sync your high-performing customer segments directly to your email
          platform.
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
          selected={selected}
          onSelect={setSelected}
        />
        <MailchimpIntegrationCard
          selected={selected}
          onSelect={setSelected}
        />
        <SendGridIntegrationCard
          selected={selected}
          onSelect={setSelected}
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
        <div>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "700",
              color: "#374151",
              marginBottom: "4px",
            }}
          >
            Select Provider
          </label>
          <select 
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #D1D5DB",
              borderRadius: "6px",
              backgroundColor: "white",
              fontSize: "14px",
              cursor: "pointer",
            }}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Choose your email platform...</option>
            <option value="klaviyo">Klaviyo</option>
            <option value="mailchimp">Mailchimp</option>
            <option value="sendgrid">SendGrid</option>
          </select>
        </div>

        <button 
          disabled={!selected}
          onClick={() => {
            // Save progress when email service is connected
            if (onTaskComplete && selected) {
              onTaskComplete();
            }
            onComplete();
          }}
          style={{
            width: "100%",
            fontWeight: "700",
            padding: "12px",
            borderRadius: "6px",
            transition: "all 0.2s",
            border: "none",
            cursor: selected ? "pointer" : "not-allowed",
            backgroundColor: selected ? "#008060" : "#F3F4F6",
            color: selected ? "white" : "#9CA3AF",
            boxShadow: selected
              ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
              : "none",
          }}
          onMouseEnter={(e) => {
            if (selected) {
              e.currentTarget.style.backgroundColor = "#006e52";
            }
          }}
          onMouseLeave={(e) => {
            if (selected) {
              e.currentTarget.style.backgroundColor = "#008060";
            }
          }}
        >
          Connect Service
        </button>
      </div>
    </div>
  );
};

export default Step4;
