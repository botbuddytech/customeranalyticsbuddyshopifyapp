import React from "react";
import { categories } from "../data/categories";

interface ChatEmptyStateProps {
  hoveredCategory: string | null;
  setHoveredCategory: (id: string | null) => void;
  onSend: (text: string) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  hoveredCategory,
  setHoveredCategory,
  onSend,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
      }}
    >
      <div
        style={{
          width: "64px",
          height: hoveredCategory ? "0" : "64px",
          opacity: hoveredCategory ? 0 : 1,
          backgroundColor: "#008060",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          marginBottom: hoveredCategory ? "0" : "24px",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        <svg
          style={{ width: "40px", height: "40px" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          ></path>
        </svg>
      </div>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#202223",
          marginBottom: hoveredCategory ? "0" : "32px",
          textAlign: "center",
          height: hoveredCategory ? "0" : "auto",
          opacity: hoveredCategory ? 0 : 1,
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        How can I help you today?
      </h1>

      {/* Prebuilt Query Categories - Hover Expandable Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
          width: "100%",
          maxWidth: "800px",
          marginBottom: hoveredCategory ? "24px" : "0",
          transition: "margin-bottom 0.3s ease",
        }}
      >
        {categories.map((category) => {
          const isHovered = hoveredCategory === category.id;
          return (
            <div
              key={category.id}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => {
                if (hoveredCategory === category.id) {
                  setHoveredCategory(null);
                }
              }}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e1e3e5",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                zIndex: isHovered ? 10 : 1,
              }}
            >
              <div
                style={{
                  padding: isHovered ? "20px" : "16px 20px",
                  transition: "padding 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: isHovered ? "12px" : "0",
                    transition: "margin-bottom 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#202223",
                    }}
                  >
                    {category.title}
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: isHovered ? "500px" : "0",
                    opacity: isHovered ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.3s ease, opacity 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      paddingTop: isHovered ? "8px" : "0",
                    }}
                  >
                    {category.queries.map((query) => (
                      <button
                        key={query.title}
                        onClick={() => onSend(query.prompt)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "12px 16px",
                          backgroundColor: "#f9fafb",
                          border: "1px solid #e1e3e5",
                          borderRadius: "8px",
                          transition: "all 0.2s",
                          textAlign: "left",
                          cursor: "pointer",
                          width: "100%",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#202223",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f1f2";
                          e.currentTarget.style.borderColor = "#008060";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                          e.currentTarget.style.borderColor = "#e1e3e5";
                        }}
                      >
                        {query.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
