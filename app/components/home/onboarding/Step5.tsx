import React from "react";
import { CheckIcon } from "./icons";

interface Step5Props {
  onComplete: () => void;
}

const Step5: React.FC<Step5Props> = ({ onComplete }) => {
  return (
    <div
      style={{
        textAlign: "center",
        maxWidth: "576px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "24px",
        paddingBottom: "24px",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            width: "120px",
            height: "120px",
            backgroundColor: "#F0FDF4",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            boxShadow: "0 20px 25px -5px rgba(0, 128, 96, 0.1)",
            animation: "bounce 1s",
          }}
        >
          <div style={{ color: "#16A34A", transform: "scale(2)" }}>
            <CheckIcon />
          </div>
        </div>
        <h2
          style={{
            fontSize: "36px",
            fontWeight: "800",
            color: "#202223",
            marginBottom: "16px",
          }}
        >
          🎉 Onboarding Complete!
        </h2>
        <p
          style={{
            color: "#6B7280",
            fontSize: "18px",
            lineHeight: "1.75",
            marginBottom: "8px",
          }}
        >
          You're all set! Your Customer Analytics Buddy is ready to help you
          understand and grow your customer base.
        </p>
        <p
          style={{
            color: "#9CA3AF",
            fontSize: "16px",
            lineHeight: "1.75",
          }}
        >
          Start exploring your dashboard and discover powerful insights about
          your customers.
        </p>
      </div>

      <div
        style={{
          width: "100%",
          backgroundColor: "#F9FAFB",
          border: "2px solid #E5E7EB",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#16A34A",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckIcon />
            </div>
            <div>
              <p
                style={{
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Store Connected
              </p>
              <p style={{ color: "#6B7280", fontSize: "14px" }}>
                Your Shopify store is securely linked
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#16A34A",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckIcon />
            </div>
            <div>
              <p
                style={{
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Plan Selected
              </p>
              <p style={{ color: "#6B7280", fontSize: "14px" }}>
                Your subscription plan is active
              </p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#16A34A",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckIcon />
            </div>
            <div>
              <p
                style={{
                  fontWeight: "700",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Dashboard Ready
              </p>
              <p style={{ color: "#6B7280", fontSize: "14px" }}>
                All features are unlocked and ready to use
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Step5;
