import React, { useState } from "react";
import { Button } from "./PolarisUI";

interface ChatHistory {
  id: string;
  title: string;
  date: string;
  messages: any[];
  sessionId: string;
}

interface SidebarProps {
  history: ChatHistory[];
  onNewChat: () => void;
  onHistoryClick: (historyItem: ChatHistory) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  history,
  onNewChat,
  onHistoryClick,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredProfile, setHoveredProfile] = useState(false);

  return (
    <div
      style={{
        width: "288px",
        minWidth: "288px",
        backgroundColor: "#f1f2f3",
        height: "600px",
        borderRadius: "12px",
        border: "1px solid #e1e3e5",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#008060",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              style={{ width: "20px", height: "20px", color: "white" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
          </div>
          <span
            style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#202223",
            }}
          >
            Customer Analytics AI
          </span>
        </div>

        <div style={{ width: "100%" }}>
          <Button outline onClick={onNewChat}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <svg
                style={{ width: "16px", height: "16px", marginRight: "8px" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              New chat
            </span>
          </Button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingLeft: "12px",
          paddingRight: "12px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "#6d7175",
            paddingLeft: "8px",
            paddingRight: "8px",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          History
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {history.length === 0 ? (
            <div
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                color: "#6d7175",
                fontStyle: "italic",
              }}
            >
              No chat history yet
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onHistoryClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor:
                    hoveredItem === item.id ? "#e4e5e7" : "transparent",
                  transition: "background-color 0.2s",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "#202223",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {item.title}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#6d7175",
                    opacity: hoveredItem === item.id ? 1 : 0,
                    transition: "opacity 0.2s",
                  }}
                >
                  {item.date}
                </span>
              </div>
            ))
          )}
        </nav>
      </div>

      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #e1e3e5",
        }}
      >
        <div
          onMouseEnter={() => setHoveredProfile(true)}
          onMouseLeave={() => setHoveredProfile(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: hoveredProfile ? "#e4e5e7" : "transparent",
            padding: "8px",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#008060",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            JD
          </div>
          <div
            style={{
              fontSize: "13px",
              overflow: "hidden",
            }}
          >
            <p
              style={{
                fontWeight: "500",
                color: "#202223",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Jane Doe Store
            </p>
            <p
              style={{
                color: "#6d7175",
                fontSize: "11px",
              }}
            >
              jane@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
