import { Card, BlockStack, Text, Button } from "@shopify/polaris";
import type { SupportChannel } from "./supportChannelsConfig";

interface SupportChannelCardProps {
  channel: SupportChannel;
}

/**
 * Support Channel Card Component
 * 
 * Displays a single support channel card with icon, title, description, and button
 */
export function SupportChannelCard({ channel }: SupportChannelCardProps) {
  // Icon component based on channel type
  const renderIcon = () => {
    if (channel.title.includes("Chat")) {
      // Chat icon (green bubble with dots)
      return (
        <div
          style={{
            backgroundColor: channel.iconColor,
            width: "48px",
            height: "48px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              fill="white"
            />
            <circle cx="7" cy="12" r="1.5" fill="white" />
            <circle cx="12" cy="12" r="1.5" fill="white" />
            <circle cx="17" cy="12" r="1.5" fill="white" />
          </svg>
        </div>
      );
    } else if (channel.title.includes("Email")) {
      // Email icon (blue envelope)
      return (
        <div
          style={{
            backgroundColor: channel.iconColor,
            width: "48px",
            height: "48px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
              fill="white"
            />
          </svg>
        </div>
      );
    } else {
      // Calendar icon (gold/orange)
      return (
        <div
          style={{
            backgroundColor: channel.iconColor,
            width: "48px",
            height: "48px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11Z"
              fill="white"
            />
          </svg>
        </div>
      );
    }
  };

  return (
    <Card>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <BlockStack gap="500" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Icon at top */}
          <div style={{ marginBottom: "16px" }}>
            {renderIcon()}
          </div>
          
          {/* Title below icon with good spacing */}
          <div>
            <Text as="h3" variant="headingSm" fontWeight="semibold">
              {channel.title}
            </Text>
          </div>
          
          {/* Description below title with good spacing */}
          <div style={{ flex: 1, paddingBottom: "8px" }}>
            <Text as="p" variant="bodySm" tone="subdued">
              {channel.description}
            </Text>
          </div>
          
          {/* Button at bottom */}
          <div style={{ marginTop: "auto", paddingTop: "16px" }}>
            <Button
              variant="secondary"
              onClick={channel.onClick}
              fullWidth
            >
              {channel.buttonText}
            </Button>
          </div>
        </BlockStack>
      </div>
    </Card>
  );
}

