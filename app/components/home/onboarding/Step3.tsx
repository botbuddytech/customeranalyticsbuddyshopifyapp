import React, { useState, useEffect, useCallback } from "react";
import { useFetcher } from "react-router";
import { MagicWandIcon, InfoIcon, RobotIcon, CommentDotsIcon } from "./icons";
import { parseApiResponse } from "../../ai-search-analyzer/utils/ChatUtils";

// Prompt constant - can be easily modified later
const AI_PROMPT = "Generate a list of all my customers";

interface Step3Props {
  onComplete: () => void;
  onTaskComplete?: () => void;
  shop?: string;
}

const Step3: React.FC<Step3Props> = ({ onComplete, onTaskComplete, shop }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [resultList, setResultList] = useState<any[]>([]);
  const [extractedQuery, setExtractedQuery] = useState<string>("");
  const chatFetcher = useFetcher();
  const queryFetcher = useFetcher<{
    success: boolean;
    data?: any;
    error?: string;
  }>();
  const sessionId = `step3_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const questions = [AI_PROMPT];

  // Flatten nested objects for table display (same as SqlQueryPanel)
  const flattenObject = (obj: any, prefix = ""): Record<string, any> => {
    const flattened: Record<string, any> = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (value === null || value === undefined) {
          flattened[newKey] = "";
        } else if (Array.isArray(value)) {
          flattened[newKey] =
            value.length > 0
              ? typeof value[0] === "object"
                ? `[${value.length} items]`
                : value.join(", ")
              : "[]";
        } else if (typeof value === "object") {
          const nested = flattenObject(value, newKey);
          Object.assign(flattened, nested);
        } else {
          flattened[newKey] = value;
        }
      }
    }

    return flattened;
  };

  // Format result data for display (same as SqlQueryPanel)
  const formatResult = (data: any): any[] => {
    if (!data) return [];

    let arrayData: any[] = [];

    if (Array.isArray(data)) {
      arrayData = data;
    } else if (data.nodes && Array.isArray(data.nodes)) {
      arrayData = data.nodes;
    } else if (data.edges && Array.isArray(data.edges)) {
      arrayData = data.edges
        .map((edge: any) => edge.node)
        .filter((node: any) => node !== null && node !== undefined);
    } else {
      const findArray = (obj: any): any[] | null => {
        for (const key in obj) {
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
          if (
            obj[key] &&
            typeof obj[key] === "object" &&
            obj[key].nodes &&
            Array.isArray(obj[key].nodes)
          ) {
            return obj[key].nodes;
          }
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

    return arrayData.map((item) => {
      if (typeof item === "object" && item !== null) {
        return flattenObject(item);
      }
      return { value: item };
    });
  };

  // Handle query execution results
  useEffect(() => {
    if (queryFetcher.state === "idle" && queryFetcher.data) {
      const queryResult = queryFetcher.data;
      if (queryResult.success && queryResult.data) {
        const formatted = formatResult(queryResult.data);
        if (formatted.length > 0) {
          setResultList(formatted);
          console.log(
            "[Step3] Query executed, found",
            formatted.length,
            "items",
          );

          // Save progress when query results are received
          if (onTaskComplete) {
            onTaskComplete();
          }
        }
      } else if (queryResult.error) {
        console.error("[Step3] Query execution error:", queryResult.error);
      }
    }
  }, [queryFetcher.state, queryFetcher.data, onTaskComplete]);

  // Handle chat response from API
  useEffect(() => {
    if (chatFetcher.state === "idle" && chatFetcher.data) {
      const data = chatFetcher.data as {
        success: boolean;
        response?: string;
        error?: string;
      };

      if (data.success && data.response) {
        const { content: responseContent, query: queryFromResponse } =
          parseApiResponse(data.response);
        setInsight(responseContent);

        // Extract and execute GraphQL query if present
        if (
          queryFromResponse &&
          queryFromResponse.trim() &&
          queryFromResponse !== "null"
        ) {
          setExtractedQuery(queryFromResponse);

          // Auto-execute the query
          let finalQuery = queryFromResponse.trim();

          // Ensure 'id' is requested for customers
          if (
            finalQuery.includes("customers") &&
            finalQuery.includes("node {") &&
            !finalQuery.includes("id")
          ) {
            finalQuery = finalQuery.replace(/node\s*\{/, "node { id ");
          }

          setTimeout(() => {
            const formData = new FormData();
            formData.append("query", finalQuery);
            queryFetcher.submit(formData, {
              method: "POST",
              action: "/api/ai-search/execute-query",
            });
          }, 100);
        } else {
          // If no query, try to extract list data directly from response (fallback)
          let foundList: any[] = [];
          try {
            // First, try to parse the entire response as JSON
            let parsed: any = null;
            try {
              parsed = JSON.parse(data.response);
            } catch (e) {
              // If not JSON, try to find JSON in the response
              const jsonMatch = data.response.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  parsed = JSON.parse(jsonMatch[0]);
                } catch (e2) {
                  // Still not valid JSON
                }
              }
            }

            if (parsed) {
              // Check for various possible data structures (prioritize data field)
              if (
                parsed.data &&
                Array.isArray(parsed.data) &&
                parsed.data.length > 0
              ) {
                foundList = parsed.data;
              } else if (
                parsed.results &&
                Array.isArray(parsed.results) &&
                parsed.results.length > 0
              ) {
                foundList = parsed.results;
              } else if (
                parsed.customers &&
                Array.isArray(parsed.customers) &&
                parsed.customers.length > 0
              ) {
                foundList = parsed.customers;
              } else if (
                parsed.list &&
                Array.isArray(parsed.list) &&
                parsed.list.length > 0
              ) {
                foundList = parsed.list;
              } else if (Array.isArray(parsed) && parsed.length > 0) {
                // If the parsed response is directly an array
                foundList = parsed;
              } else if (parsed.reply) {
                // Check if reply contains JSON with data
                try {
                  const replyParsed = JSON.parse(parsed.reply);
                  if (
                    replyParsed.data &&
                    Array.isArray(replyParsed.data) &&
                    replyParsed.data.length > 0
                  ) {
                    foundList = replyParsed.data;
                  } else if (
                    replyParsed.results &&
                    Array.isArray(replyParsed.results) &&
                    replyParsed.results.length > 0
                  ) {
                    foundList = replyParsed.results;
                  } else if (
                    Array.isArray(replyParsed) &&
                    replyParsed.length > 0
                  ) {
                    foundList = replyParsed;
                  }
                } catch (e) {
                  // Reply is not JSON, continue
                }
              }
            }

            // If we still don't have a list, try to extract from the content string
            if (foundList.length === 0 && responseContent) {
              // Look for JSON arrays in the content
              const arrayMatch = responseContent.match(/\[[\s\S]*\]/);
              if (arrayMatch) {
                try {
                  const arrayParsed = JSON.parse(arrayMatch[0]);
                  if (Array.isArray(arrayParsed) && arrayParsed.length > 0) {
                    foundList = arrayParsed;
                  }
                } catch (e) {
                  // Not a valid JSON array
                }
              }
            }

            // Set the list if we found one
            if (foundList.length > 0) {
              setResultList(foundList);
              console.log(
                "[Step3] Found list with",
                foundList.length,
                "items:",
                foundList,
              );

              // Save progress when list is found
              if (onTaskComplete) {
                onTaskComplete();
              }
            }
          } catch (e) {
            console.error("[Step3] Error parsing response:", e);
            // If no structured data, just show the text response
          }
        }

        // Save progress when AI insight is generated (if no query to execute)
        if (
          !queryFromResponse ||
          !queryFromResponse.trim() ||
          queryFromResponse === "null"
        ) {
          if (onTaskComplete) {
            onTaskComplete();
          }
        }
      } else if (data.error) {
        setInsight(`Error: ${data.error}`);
        console.error("[Step3] AI Chat Error:", data.error);
      }
    }
  }, [chatFetcher.state, chatFetcher.data, onTaskComplete]);

  const generateAIInsight = useCallback(
    (prompt: string) => {
      setSelectedQuestion(prompt);
      setInsight(null);
      setResultList([]);

      if (!shop) {
        setInsight("Error: Shop information is required");
        return;
      }

      const formData = new FormData();
      formData.append("message", prompt);
      formData.append("sessionId", sessionId);
      formData.append("shopId", shop);

      chatFetcher.submit(formData, {
        method: "POST",
        action: "/api/ai-search/chat",
      });
    },
    [shop, sessionId, chatFetcher],
  );

  const isLoading =
    chatFetcher.state === "submitting" ||
    chatFetcher.state === "loading" ||
    queryFetcher.state === "submitting" ||
    queryFetcher.state === "loading";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        height: "100%",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#202223",
              marginBottom: "8px",
            }}
          >
            AI Analytics Assistant
          </h2>
          <p style={{ color: "#4B5563" }}>
            Interact with your data through natural language. Our AI buddies
            transform complex sheets into actionable growth plans.
          </p>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "12px",
            }}
          >
            Available Queries
          </p>
          {questions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => generateAIInsight(q)}
              disabled={isLoading}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                border: "1px solid",
                borderRadius: "8px",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
                cursor: isLoading ? "not-allowed" : "pointer",
                backgroundColor: selectedQuestion === q ? "#F0FDF4" : "white",
                borderColor: selectedQuestion === q ? "#008060" : "#E5E7EB",
              }}
              onMouseEnter={(e) => {
                if (!isLoading && selectedQuestion !== q) {
                  e.currentTarget.style.borderColor = "#9CA3AF";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && selectedQuestion !== q) {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "500" }}>{q}</span>
              <div
                style={{
                  color: selectedQuestion === q ? "#008060" : "#D1D5DB",
                }}
              >
                <MagicWandIcon />
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <div style={{ color: "#3B82F6", marginTop: "4px" }}>
            <InfoIcon />
          </div>
          <p style={{ fontSize: "14px", color: "#1E40AF" }}>
            <strong>Pro Tip:</strong> Click the analysis query to generate a
            real-time report based on your connected store data.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            backgroundColor: "#202223",
            borderRadius: "8px 8px 0 0",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#EF4444",
              }}
            ></div>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#F59E0B",
              }}
            ></div>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10B981",
              }}
            ></div>
          </div>
          <span
            style={{
              fontSize: "10px",
              color: "#9CA3AF",
              fontFamily: "monospace",
              textTransform: "uppercase",
            }}
          >
            AI_Terminal_v4.2
          </span>
        </div>

        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #E5E7EB",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: "300px",
          }}
        >
          {isLoading ? (
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                textAlign: "center",
              }}
            >
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    border: "4px solid #D1FAE5",
                    borderRadius: "50%",
                  }}
                ></div>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    border: "4px solid #008060",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                ></div>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#374151",
                }}
              >
                Crunching numbers...
              </p>
              <p
                style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}
              >
                Processing 12,402 data points
              </p>
            </div>
          ) : insight ? (
            <div style={{ padding: "24px", overflowY: "auto" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#D1FAE5",
                    color: "#008060",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ width: "16px", height: "16px" }}>
                    <RobotIcon />
                  </div>
                </div>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  Insight Generated
                </span>
              </div>
              <div
                style={{
                  backgroundColor: "#F9FAFB",
                  padding: "16px",
                  borderRadius: "4px",
                  border: "1px solid #F3F4F6",
                  fontSize: "14px",
                  lineHeight: "1.75",
                  color: "#374151",
                  fontStyle: "italic",
                }}
              >
                "{insight}"
              </div>

              {/* Display result list if available */}
              {resultList.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#374151",
                      marginBottom: "12px",
                    }}
                  >
                    Generated List ({resultList.length} items)
                  </p>
                  <div
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid #E5E7EB",
                      borderRadius: "4px",
                      backgroundColor: "white",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "12px",
                      }}
                    >
                      <thead
                        style={{
                          backgroundColor: "#F9FAFB",
                          position: "sticky",
                          top: 0,
                        }}
                      >
                        <tr>
                          {Object.keys(resultList[0] || {}).map((key) => (
                            <th
                              key={key}
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                fontWeight: "700",
                                color: "#374151",
                                borderBottom: "1px solid #E5E7EB",
                              }}
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultList.slice(0, 10).map((item, idx) => (
                          <tr
                            key={idx}
                            style={{ borderBottom: "1px solid #F3F4F6" }}
                          >
                            {Object.values(item).map((value: any, valIdx) => (
                              <td
                                key={valIdx}
                                style={{ padding: "8px", color: "#6B7280" }}
                              >
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {resultList.length > 10 && (
                      <div
                        style={{
                          padding: "8px",
                          textAlign: "center",
                          color: "#9CA3AF",
                          fontSize: "11px",
                        }}
                      >
                        Showing first 10 of {resultList.length} items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                textAlign: "center",
                opacity: 0.4,
              }}
            >
              <CommentDotsIcon />
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  marginTop: "16px",
                }}
              >
                Select the analysis query to generate your report
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Step3;
