import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFetcher } from "react-router";
import { Spinner } from "./PolarisUI";
import {
  Card,
  BlockStack,
  Text,
  Button,
  Popover,
  ActionList,
  InlineStack,
} from "@shopify/polaris";
import { ExportIcon, EmailIcon } from "@shopify/polaris-icons";
import { SaveListModal } from "../../filter-audience/SaveListModal";
import type { FilterData } from "../../filter-audience/types";

interface GraphQLPreviewPanelProps {
  externalQuery?: string;
}

const GraphQLPreviewPanel: React.FC<GraphQLPreviewPanelProps> = ({
  externalQuery,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportPopoverOpen, setExportPopoverOpen] = useState(false);
  
  // Save List Modal State
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [saveListError, setSaveListError] = useState<string | null>(null);

  const queryFetcher = useFetcher<{
    success: boolean;
    data?: any;
    error?: string;
  }>();

  const isLoading = queryFetcher.state !== "idle";
  const result = queryFetcher.data;

  // Flatten nested objects for table display
  const flattenObject = (obj: any, prefix = ""): Record<string, any> => {
    const flattened: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (value === null || value === undefined) {
          flattened[newKey] = "";
        } else if (Array.isArray(value)) {
          // For arrays, join them or show count
          flattened[newKey] =
            value.length > 0
              ? typeof value[0] === "object"
                ? `[${value.length} items]`
                : value.join(", ")
              : "[]";
        } else if (typeof value === "object") {
          // Recursively flatten nested objects
          const nested = flattenObject(value, newKey);
          Object.assign(flattened, nested);
        } else {
          flattened[newKey] = value;
        }
      }
    }

    return flattened;
  };

  // Format result data for display
  const formatResult = (data: any): any[] => {
    if (!data) return [];

    let arrayData: any[] = [];

    // If it's an array, use it directly
    if (Array.isArray(data)) {
      arrayData = data;
    }
    // If it has a nodes property (GraphQL pagination), use nodes
    else if (data.nodes && Array.isArray(data.nodes)) {
      arrayData = data.nodes;
    }
    // If it has edges property (GraphQL connection pattern), extract nodes from edges
    else if (data.edges && Array.isArray(data.edges)) {
      // Extract node from each edge
      arrayData = data.edges
        .map((edge: any) => edge.node)
        .filter((node: any) => node !== null && node !== undefined);
    }
    // If it's an object, try to find array values
    else {
      const findArray = (obj: any): any[] | null => {
        for (const key in obj) {
          // Check for edges structure first
          if (
            obj[key] &&
            typeof obj[key] === "object" &&
            obj[key].edges &&
            Array.isArray(obj[key].edges)
          ) {
            return obj[key].edges
              .map((edge: any) => edge.node)
              .filter((node: any) => node !== null && node !== undefined);
          }
          // Check for nodes structure
          if (
            obj[key] &&
            typeof obj[key] === "object" &&
            obj[key].nodes &&
            Array.isArray(obj[key].nodes)
          ) {
            return obj[key].nodes;
          }
          // Check for direct arrays
          if (Array.isArray(obj[key])) {
            return obj[key];
          }
          if (typeof obj[key] === "object" && obj[key] !== null) {
            const found = findArray(obj[key]);
            if (found) return found;
          }
        }
        return null;
      };
      const found = findArray(data);
      arrayData = found || [];
    }

    // Flatten each object in the array for table display
    return arrayData.map((item) => {
      if (typeof item === "object" && item !== null) {
        return flattenObject(item);
      }
      return { value: item };
    });
  };

  const resultData = result?.data ? formatResult(result.data) : [];

  // Auto-scroll to bottom when results change
  useEffect(() => {
    if (scrollRef.current && result) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [result, resultData]);

  // Sync external query (from chat bot) and auto-execute
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      // Log query for debugging
      console.log("GraphQL Query Generated (Raw):", externalQuery);

      let finalQuery = externalQuery.trim();

      // Ensure 'id' is requested for customers so we can save the list later
      if (finalQuery.includes("customers") && finalQuery.includes("node {") && !finalQuery.includes("id")) {
        // Simple injection: replace "node {" with "node { id "
        // This is a heuristic but works for standard AI outputs
        finalQuery = finalQuery.replace(/node\s*\{/, "node { id ");
        console.log("GraphQL Query Adjusted (Added ID):", finalQuery);
      }

      // Auto-execute the query after a short delay to ensure state is updated
      setTimeout(() => {
        const formData = new FormData();
        formData.append("query", finalQuery);
        queryFetcher.submit(formData, {
          method: "POST",
          action: "/api/ai-search/execute-query",
        });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery]);

  // Export handlers
  const handleExportPDF = useCallback(async () => {
    if (!resultData || resultData.length === 0) return;

    setIsExporting(true);
    try {
      const headers = Object.keys(resultData[0]);

      let htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>GraphQL Query Results Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>GraphQL Query Results Export</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Total Rows: ${resultData.length}</p>
            <table>
              <thead>
                <tr>
                  ${headers
                    .map((header) => `<th>${header.replace(/\./g, " → ")}</th>`)
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${resultData
                  .map(
                    (row) => `
                  <tr>
                    ${headers
                      .map(
                        (header) =>
                          `<td>${String(row[header] || "").replace(
                            /</g,
                            "&lt;",
                          )}</td>`,
                      )
                      .join("")}
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `graphql-results-${new Date().toISOString().split("T")[0]}.html`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } finally {
      setIsExporting(false);
    }
  }, [resultData]);

  const handleExportCSV = useCallback(async () => {
    if (!resultData || resultData.length === 0) return;

    setIsExporting(true);
    try {
      const headers = Object.keys(resultData[0]);

      const csvRows = [
        headers.map((h) => `"${h.replace(/\./g, " → ")}"`).join(","),
        ...resultData.map((row) =>
          headers
            .map((header) => {
              const value = String(row[header] || "");
              return `"${value.replace(/"/g, '""')}"`;
            })
            .join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `graphql-results-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } finally {
      setIsExporting(false);
    }
  }, [resultData]);

  const handleExportExcel = useCallback(async () => {
    if (!resultData || resultData.length === 0) return;

    setIsExporting(true);
    try {
      const headers = Object.keys(resultData[0]);

      const csvRows = [
        headers.map((h) => `"${h.replace(/\./g, " → ")}"`).join(","),
        ...resultData.map((row) =>
          headers
            .map((header) => {
              const value = String(row[header] || "");
              return `"${value.replace(/"/g, '""')}"`;
            })
            .join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `graphql-results-${new Date().toISOString().split("T")[0]}.xls`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } finally {
      setIsExporting(false);
    }
  }, [resultData]);

  const handleCreateCampaign = useCallback(() => {
    console.log("Create campaign:", resultData);
  }, [resultData]);

  const handleSaveToList = useCallback(() => {
    if (!resultData || resultData.length === 0) return;
    setSaveListError(null);
    setShowSaveListModal(true);
  }, [resultData]);

  // Extract customer ids from GraphQL result
  const extractCustomerIds = (data: any): string[] => {
    const ids: Set<string> = new Set();
    
    const traverse = (obj: any) => {
      if (!obj) return;
      
      if (typeof obj === "object") {
        // Check if object looks like a customer node or has an ID
        // Typical structure: { id: "gid://shopify/Customer/..." }
        if (obj.id && typeof obj.id === "string" && obj.id.includes("Customer")) {
          ids.add(obj.id);
        }
        
        // Also checks specifically for customer query structure
        if (obj.customer && obj.customer.id) {
            ids.add(obj.customer.id);
        }

        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            traverse(obj[key]);
          }
        }
      } else if (Array.isArray(obj)) {
        obj.forEach(traverse);
      }
    };
    
    traverse(data);
    return Array.from(ids);
  };

  const handleSaveListSubmit = async (listName: string) => {
    setIsSavingList(true);
    setSaveListError(null);

    try {
      // Create a dummy FilterData object with the GraphQL query
      const filters: FilterData = {
        location: [],
        products: [],
        timing: [],
        device: [],
        payment: [],
        delivery: [],
        graphqlQuery: externalQuery,
      };

      const formData = new FormData();
      formData.append("listName", listName);
      formData.append("filters", JSON.stringify(filters));
      formData.append("source", "ai-search");

      // Extract customer IDs from the current result
      if (result && result.data) {
        const customerIds = extractCustomerIds(result.data);
        console.log("Extracted Customer IDs:", customerIds);
        if (customerIds.length > 0) {
           formData.append("customerIds", JSON.stringify(customerIds));
        }
      }
      
      const response = await fetch("/api/filter-audience/save-list", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setSaveListError(data.error);
        setIsSavingList(false);
        return;
      }

      if (data.success) {
        setShowSaveListModal(false);
        setSaveListError(null);
        // Optional: specific success notification
        console.log("List saved successfully:", data.list);
      }
    } catch (error) {
      console.error("Error saving list:", error);
      setSaveListError(
        error instanceof Error ? error.message : "Failed to save list",
      );
    } finally {
      setIsSavingList(false);
    }
  };

  const toggleExportPopover = useCallback(() => {
    setExportPopoverOpen((prev) => !prev);
  }, []);

  const handleExportFormat = useCallback(
    async (format: "pdf" | "csv" | "excel") => {
      setExportPopoverOpen(false);
      if (format === "pdf") {
        await handleExportPDF();
      } else if (format === "csv") {
        await handleExportCSV();
      } else if (format === "excel") {
        await handleExportExcel();
      }
    },
    [handleExportPDF, handleExportCSV, handleExportExcel],
  );

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .pulse-animation {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          /* Custom scrollbar styling for table horizontal scroll */
          .table-scroll-container::-webkit-scrollbar {
            height: 12px;
          }
          .table-scroll-container::-webkit-scrollbar-track {
            background: #f1f2f3;
            border-radius: 6px;
          }
          .table-scroll-container::-webkit-scrollbar-thumb {
            background: #c1c3c5;
            border-radius: 6px;
            border: 2px solid #f1f2f3;
          }
          .table-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #a1a3a5;
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "white",
          position: "relative",
        }}
      >
        {/* Quick Actions Bar */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e1e3e5",
            backgroundColor: "white",
          }}
        >
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                ⚡ Quick Actions
              </Text>

              <InlineStack gap="200" wrap>
                <Popover
                  active={exportPopoverOpen}
                  activator={
                    <Button
                      variant="secondary"
                      icon={isExporting ? undefined : ExportIcon}
                      loading={isExporting}
                      disabled={
                        !resultData ||
                        resultData.length === 0 ||
                        isExporting ||
                        !!result?.error
                      }
                      onClick={toggleExportPopover}
                    >
                      Export
                    </Button>
                  }
                  onClose={toggleExportPopover}
                >
                  <ActionList
                    items={[
                      {
                        content: "Export as PDF",
                        onAction: () => handleExportFormat("pdf"),
                      },
                      {
                        content: "Export as CSV",
                        onAction: () => handleExportFormat("csv"),
                      },
                      {
                        content: "Export as Excel",
                        onAction: () => handleExportFormat("excel"),
                      },
                    ]}
                  />
                </Popover>

                <Button
                  variant="secondary"
                  icon={EmailIcon}
                  disabled={true}
                  onClick={handleCreateCampaign}
                >
                  Create campaign
                </Button>

                <Button
                  variant="secondary"
                  disabled={
                    !resultData || resultData.length === 0 || !!result?.error
                  }
                  onClick={handleSaveToList}
                >
                  Save to lists
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </div>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            paddingTop: "40px",
            paddingBottom: "40px",
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          <div
            style={{
              maxWidth: "768px",
              margin: "0 auto",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "50vh",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#008060",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <svg
                    className="pulse-animation"
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
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
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Spinner />
                </div>
              </div>
            ) : result ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {result.error ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "#d72c0d",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <svg
                        style={{ width: "20px", height: "20px" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "#d72c0d",
                          fontSize: "15px",
                          lineHeight: "1.6",
                          marginBottom: "8px",
                          fontWeight: "600",
                        }}
                      >
                        Error
                      </div>
                      <div
                        style={{
                          color: "#202223",
                          fontSize: "15px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {result.error}
                      </div>
                    </div>
                  </div>
                ) : resultData && resultData.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6d7175",
                        fontWeight: "500",
                        marginBottom: "12px",
                      }}
                    >
                      Results ({resultData.length}{" "}
                      {resultData.length === 1 ? "row" : "rows"})
                    </div>
                    <div
                      className="table-scroll-container"
                      style={{
                        overflowX: "auto",
                        overflowY: "visible",
                        backgroundColor: "white",
                        border: "1px solid #d1d3d6",
                        borderRadius: "8px",
                        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                        // Custom scrollbar styling for better visibility (Firefox)
                        scrollbarWidth: "thin",
                        scrollbarColor: "#c1c3c5 #f1f2f3",
                      }}
                    >
                      <table
                        style={{
                          width: "100%",
                          minWidth: "100%",
                          borderCollapse: "separate",
                          borderSpacing: 0,
                          fontSize: "13px",
                          backgroundColor: "white",
                          tableLayout: "auto",
                        }}
                      >
                        <thead>
                          <tr>
                            {Object.keys(resultData[0]).map((key, colIdx) => (
                              <th
                                key={key}
                                style={{
                                  padding: "14px 16px",
                                  textAlign: "left",
                                  fontWeight: "600",
                                  color: "#202223",
                                  fontSize: "12px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  backgroundColor: "#f6f6f7",
                                  borderBottom: "2px solid #d1d3d6",
                                  borderRight:
                                    colIdx <
                                    Object.keys(resultData[0]).length - 1
                                      ? "1px solid #e1e3e5"
                                      : "none",
                                  whiteSpace: "nowrap",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 10,
                                }}
                              >
                                {key.replace(/\./g, " → ")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {resultData
                            .slice(0, 100)
                            .map((row: any, idx: number) => (
                              <tr
                                key={idx}
                                style={{
                                  backgroundColor:
                                    idx % 2 === 0 ? "white" : "#fafbfb",
                                  borderBottom:
                                    idx < resultData.slice(0, 100).length - 1
                                      ? "1px solid #e1e3e5"
                                      : "none",
                                  transition: "background-color 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    "#f0f1f2";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor =
                                    idx % 2 === 0 ? "white" : "#fafbfb";
                                }}
                              >
                                {Object.keys(resultData[0]).map(
                                  (key, colIdx) => (
                                    <td
                                      key={key}
                                      style={{
                                        padding: "12px 16px",
                                        color: "#202223",
                                        minWidth: "150px",
                                        maxWidth: "400px",
                                        wordBreak: "break-word",
                                        wordWrap: "break-word",
                                        lineHeight: "1.6",
                                        borderRight:
                                          colIdx <
                                          Object.keys(resultData[0]).length - 1
                                            ? "1px solid #f1f2f3"
                                            : "none",
                                        verticalAlign: "top",
                                        whiteSpace: "normal",
                                      }}
                                      title={String(row[key] || "")}
                                    >
                                      <div
                                        style={{
                                          whiteSpace: "pre-wrap",
                                          overflowWrap: "break-word",
                                        }}
                                      >
                                        {String(row[key] || "")}
                                      </div>
                                    </td>
                                  ),
                                )}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    {resultData.length > 100 && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6d7175",
                          textAlign: "center",
                          padding: "8px",
                        }}
                      >
                        Showing first 100 of {resultData.length} results
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "#008060",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <svg
                        style={{ width: "20px", height: "20px" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        color: "#6d7175",
                      }}
                    >
                      Query executed successfully (no data returned)
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      {/* Save List Modal */}
      <SaveListModal
        open={showSaveListModal}
        onClose={() => {
          setShowSaveListModal(false);
          setSaveListError(null);
        }}
        onSave={handleSaveListSubmit}
        isLoading={isSavingList}
        error={saveListError}
      />
      </div>
    </>
  );
};

export default GraphQLPreviewPanel;
