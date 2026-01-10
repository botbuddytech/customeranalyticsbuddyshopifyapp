import { useNavigate } from "react-router";

interface NotFoundPageProps {
  usePolaris?: boolean;
}

/**
 * 404 Not Found Page Component
 * Can be used with or without Polaris AppProvider
 */
export function NotFoundPage({ usePolaris = true }: NotFoundPageProps = {}) {
  const navigate = useNavigate();

  // If Polaris is available and usePolaris is true, use Polaris components
  if (usePolaris && typeof window !== "undefined") {
    // Check if we're in a Polaris context by trying to use Polaris components
    // This will only work if AppProvider is present
    try {
      // Dynamic import to avoid errors if Polaris is not available
      const PolarisComponents = require("@shopify/polaris");
      const PolarisIcons = require("@shopify/polaris-icons");

      const { Page, Frame, Layout, BlockStack, Text, Button, InlineStack } =
        PolarisComponents;
      const { HomeIcon } = PolarisIcons;

      return (
        <Frame>
          <Page fullWidth>
            <Layout>
              <Layout.Section>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "60vh",
                    textAlign: "center",
                    padding: "2rem",
                  }}
                >
                  <BlockStack gap="500">
                    {/* 404 Number */}
                    <div
                      style={{
                        fontSize: "120px",
                        fontWeight: "700",
                        lineHeight: "1",
                        color: "#008060",
                        opacity: "0.1",
                        marginBottom: "1rem",
                      }}
                    >
                      404
                    </div>

                    {/* Main Message */}
                    <BlockStack gap="300">
                      <Text as="h1" variant="heading2xl">
                        Page Not Found
                      </Text>
                      <Text as="p" variant="bodyLg" tone="subdued">
                        The page you're looking for doesn't exist or has been
                        moved.
                      </Text>
                    </BlockStack>

                    {/* Helpful Message */}
                    <div
                      style={{
                        maxWidth: "500px",
                        margin: "0 auto",
                        padding: "1.5rem",
                        backgroundColor: "#F6F6F7",
                        borderRadius: "8px",
                      }}
                    >
                      <Text as="p" variant="bodyMd" tone="subdued">
                        You may have typed the address incorrectly, or the page
                        may have been removed. Try going back to the home page
                        or use the navigation menu.
                      </Text>
                    </div>

                    {/* Action Buttons */}
                    <InlineStack gap="300" align="center">
                      <Button
                        primary
                        icon={HomeIcon}
                        onClick={() => navigate("/app")}
                      >
                        Go to Home
                      </Button>
                    </InlineStack>

                    {/* Quick Links */}
                    {/* <div style={{ marginTop: "2rem" }}>
                      <Text as="p" variant="bodySm" tone="subdued" alignment="center">
                        Quick links:
                      </Text>
                      <InlineStack gap="400" align="center" wrap>
                        <Button
                          plain
                          onClick={() => navigate("/app/dashboard")}
                        >
                          Dashboard
                        </Button>
                        <Button
                          plain
                          onClick={() => navigate("/app/filter-audience")}
                        >
                          Filter Audience
                        </Button>
                        <Button
                          plain
                          onClick={() => navigate("/app/my-saved-lists")}
                        >
                          My Saved Lists
                        </Button>
                        <Button
                          plain
                          onClick={() => navigate("/app/settings")}
                        >
                          Settings
                        </Button>
                      </InlineStack>
                    </div> */}
                  </BlockStack>
                </div>
              </Layout.Section>
            </Layout>
          </Page>
        </Frame>
      );
    } catch (e) {
      // Fall through to non-Polaris version if Polaris is not available
    }
  }

  // Non-Polaris version (works without AppProvider)
  // This is used for routes outside /app/* that don't have Polaris context
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "2rem",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        backgroundColor: "#f6f6f7",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          width: "100%",
        }}
      >
        {/* 404 Number */}
        <div
          style={{
            fontSize: "120px",
            fontWeight: "700",
            lineHeight: "1",
            color: "#008060",
            opacity: "0.1",
            marginBottom: "1rem",
          }}
        >
          404
        </div>

        {/* Main Message */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#202223",
            marginBottom: "0.5rem",
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#6b7280",
            marginBottom: "2rem",
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Helpful Message */}
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto 2rem",
            padding: "1.5rem",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e1e3e5",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
            }}
          >
            You may have typed the address incorrectly, or the page may have
            been removed. Try going back to the home page or use the navigation
            menu.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          <button
            onClick={() => navigate("/app")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#008060",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#006e52";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#008060";
            }}
          >
            Go to Home
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "12px 24px",
              backgroundColor: "white",
              color: "#202223",
              border: "1px solid #e1e3e5",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f6f6f7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        {/* <div>
          <p
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginBottom: "0.5rem",
            }}
          >
            Quick links:
          </p>
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/app/dashboard"
              style={{
                color: "#008060",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Dashboard
            </a>
            <a
              href="/app/filter-audience"
              style={{
                color: "#008060",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Filter Audience
            </a>
            <a
              href="/app/my-saved-lists"
              style={{
                color: "#008060",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              My Saved Lists
            </a>
            <a
              href="/app/settings"
              style={{
                color: "#008060",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Settings
            </a>
          </div>
        </div> */}
      </div>
    </div>
  );
}
