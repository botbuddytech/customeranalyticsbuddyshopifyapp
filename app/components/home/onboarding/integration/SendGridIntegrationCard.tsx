import React from "react";
import { PaperPlaneIcon } from "../icons";

interface ProviderCardProps {
  selected: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export const SendGridIntegrationCard: React.FC<ProviderCardProps> = ({
  selected,
  onSelect,
  disabled = false,
}) => {
  const id = "sendgrid";
  const isSelected = selected === id;

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      style={{
        padding: "24px",
        borderRadius: "12px",
        border: "2px solid",
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        cursor: disabled ? "default" : "pointer",
        borderColor: isSelected ? "#008060" : "#F3F4F6",
        backgroundColor: isSelected ? "rgba(240, 253, 244, 0.3)" : "white",
        opacity: disabled ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.borderColor = "#D1D5DB";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isSelected) {
          e.currentTarget.style.borderColor = "#F3F4F6";
        }
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F0F8FF",
          color: "#009DDC",
        }}
      >
        <PaperPlaneIcon />
      </div>
      <span style={{ fontWeight: "700", fontSize: "14px" }}>SendGrid</span>
    </button>
  );
};


