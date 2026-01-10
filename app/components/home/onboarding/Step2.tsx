import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { BoltIcon } from "./icons";

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

interface Step2Props {
  onComplete: () => void;
  onTaskComplete?: () => void;
  plans?: PlanWithBenefits[];
  currentPlan?: string | null;
}

const Step2: React.FC<Step2Props> = ({
  onComplete,
  onTaskComplete,
  plans = [],
  currentPlan = null,
}) => {
  const navigate = useNavigate();

  // Sort plans by price (lowest first) - fully dynamic
  const sortedPlans = [...plans].sort((a, b) => {
    // Extract numeric price for sorting
    const priceA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
    const priceB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
    return priceA - priceB;
  });

  // Helper to get all benefits for a plan as bullet list
  const getAllBenefits = (
    plan: PlanWithBenefits | undefined,
  ): React.ReactNode => {
    if (!plan) {
      return <span style={{ color: "#9CA3AF" }}>No features</span>;
    }
    // Check if benefits exist and is an array
    if (
      !plan.benefits ||
      !Array.isArray(plan.benefits) ||
      plan.benefits.length === 0
    ) {
      return <span style={{ color: "#9CA3AF" }}>No features</span>;
    }
    return (
      <ul style={{ margin: 0, paddingLeft: "20px", listStyleType: "disc" }}>
        {plan.benefits
          .map((b) => b?.label || "")
          .filter(Boolean)
          .map((label, index) => (
            <li key={index} style={{ marginBottom: "4px", color: "#374151" }}>
              {label}
            </li>
          ))}
      </ul>
    );
  };

  return (
    <div style={{ paddingTop: "8px", paddingBottom: "8px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2
          style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}
        >
          Upgrade for Lifetime Analytics
        </h2>
        <p style={{ color: "#4B5563" }}>
          Get access to your complete store history and unlock predictive
          insights.
        </p>
      </div>

      {/* Dynamic Plans Comparison Table */}
      {sortedPlans.length > 0 && (
        <div
          style={{
            overflow: "hidden",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            backgroundColor: "white",
            marginBottom: "32px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <table
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead style={{ backgroundColor: "#F9FAFB" }}>
              <tr>
                <th
                  style={{
                    padding: "16px 24px",
                    fontWeight: "700",
                    color: "#374151",
                  }}
                >
                  Features
                </th>
                {/* Dynamically generate plan columns */}
                {sortedPlans.map((plan) => {
                  const isFree =
                    parseFloat(plan.price.replace(/[^0-9.]/g, "")) === 0;
                  return (
                    <th
                      key={plan.id}
                      style={{
                        padding: "16px 24px",
                        fontWeight: "700",
                        color: isFree ? "#6B7280" : "#008060",
                        backgroundColor: isFree ? "transparent" : "#F0FDF4",
                      }}
                    >
                      {plan.name}
                      {plan.badgeLabel && ` ${plan.badgeLabel}`}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody style={{ fontSize: "14px" }}>
              {/* Price Row */}
              <tr style={{ borderTop: "1px solid #F3F4F6" }}>
                <td
                  style={{
                    padding: "16px 24px",
                    color: "#374151",
                    fontWeight: "500",
                  }}
                >
                  Price
                </td>
                {sortedPlans.map((plan) => {
                  const isFree =
                    parseFloat(plan.price.replace(/[^0-9.]/g, "")) === 0;
                  return (
                    <td
                      key={plan.id}
                      style={{
                        padding: "16px 24px",
                        color: isFree ? "#6B7280" : "#374151",
                        backgroundColor: isFree
                          ? "transparent"
                          : "rgba(240, 253, 244, 0.3)",
                        fontWeight: isFree ? "400" : "600",
                      }}
                    >
                      {plan.price}
                      {plan.priceNote && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6B7280",
                            marginLeft: "4px",
                          }}
                        >
                          {plan.priceNote}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
              {/* Features Row */}
              <tr style={{ borderTop: "1px solid #F3F4F6" }}>
                <td
                  style={{
                    padding: "16px 24px",
                    color: "#374151",
                    fontWeight: "500",
                  }}
                >
                  Features
                </td>
                {sortedPlans.map((plan) => {
                  const isFree =
                    parseFloat(plan.price.replace(/[^0-9.]/g, "")) === 0;
                  return (
                    <td
                      key={plan.id}
                      style={{
                        padding: "16px 24px",
                        color: isFree ? "#6B7280" : "#374151",
                        backgroundColor: isFree
                          ? "transparent"
                          : "rgba(240, 253, 244, 0.3)",
                        fontWeight: isFree ? "400" : "600",
                      }}
                    >
                      {getAllBenefits(plan)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => {
            // Save progress when upgrade button is clicked
            if (onTaskComplete) {
              onTaskComplete();
            }
            navigate("/app/subscription");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 32px",
            backgroundColor: "#202223",
            color: "white",
            borderRadius: "6px",
            fontWeight: "700",
            cursor: "pointer",
            border: "none",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#000000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#202223";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "scale(0.95)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <BoltIcon />
          Upgrade
        </button>

        <button
          onClick={onComplete}
          style={{
            padding: "12px 24px",
            color: "#6B7280",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            backgroundColor: "transparent",
            borderRadius: "6px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#1F2937";
            e.currentTarget.style.backgroundColor = "#F3F4F6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7280";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default Step2;
