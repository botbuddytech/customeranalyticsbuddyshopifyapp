import React, { useState, useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { Spinner } from "./PolarisUI";

interface GraphQLPreviewPanelProps {
  externalQuery?: string;
}

const GraphQLPreviewPanel: React.FC<GraphQLPreviewPanelProps> = ({ externalQuery }) => {
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryFetcher = useFetcher<{
    success: boolean;
    data?: any;
    error?: string;
  }>();

  const isLoading = queryFetcher.state !== "idle";
  const result = queryFetcher.data;

  const handleRun = () => {
    if (!query.trim()) return;

    const formData = new FormData();
    formData.append("query", query.trim());
    queryFetcher.submit(formData, {
      method: "POST",
      action: "/api/ai-search/execute-query",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleRun();
    }
  };

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
          flattened[newKey] = value.length > 0 
            ? (typeof value[0] === "object" 
                ? `[${value.length} items]` 
                : value.join(", "))
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
          if (obj[key] && typeof obj[key] === "object" && obj[key].edges && Array.isArray(obj[key].edges)) {
            return obj[key].edges
              .map((edge: any) => edge.node)
              .filter((node: any) => node !== null && node !== undefined);
          }
          // Check for nodes structure
          if (obj[key] && typeof obj[key] === "object" && obj[key].nodes && Array.isArray(obj[key].nodes)) {
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
    if (externalQuery && externalQuery.trim() && externalQuery !== query) {
      // Log query for debugging
      console.log("GraphQL Query Generated:", externalQuery);
      
      setQuery(externalQuery);
      
      // Auto-execute the query after a short delay to ensure state is updated
      setTimeout(() => {
        const formData = new FormData();
        formData.append("query", externalQuery.trim());
        queryFetcher.submit(formData, {
          method: "POST",
          action: "/api/ai-search/execute-query",
        });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery]); // Only depend on externalQuery, not query

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
                    Results ({resultData.length} {resultData.length === 1 ? "row" : "rows"})
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
                                borderRight: colIdx < Object.keys(resultData[0]).length - 1 ? "1px solid #e1e3e5" : "none",
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
                        {resultData.slice(0, 100).map((row: any, idx: number) => (
                          <tr
                            key={idx}
                            style={{
                              backgroundColor: idx % 2 === 0 ? "white" : "#fafbfb",
                              borderBottom: idx < resultData.slice(0, 100).length - 1 ? "1px solid #e1e3e5" : "none",
                              transition: "background-color 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f0f1f2";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "white" : "#fafbfb";
                            }}
                          >
                            {Object.keys(resultData[0]).map((key, colIdx) => (
                              <td
                                key={key}
                                style={{
                                  padding: "12px 16px",
                                  color: "#202223",
                                  maxWidth: "300px",
                                  wordBreak: "break-word",
                                  lineHeight: "1.5",
                                  borderRight: colIdx < Object.keys(resultData[0]).length - 1 ? "1px solid #f1f2f3" : "none",
                                  verticalAlign: "top",
                                }}
                                title={String(row[key] || "")}
                              >
                                <div
                                  style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                >
                                  {String(row[key] || "")}
                                </div>
                              </td>
                            ))}
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
      </div>
    </>
  );
};

export default GraphQLPreviewPanel;

