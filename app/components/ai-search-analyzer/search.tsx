import { useState, useRef, useCallback, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import Sidebar from "./components/Sidebar";
// @ts-ignore - TypeScript cache issue
import GraphQLPreviewPanel from "./components/SqlQueryPanel";
import { Message } from "./types";

interface ChatHistory {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  sessionId: string;
}

interface AISearchAnalyzerProps {
  apiKey: string;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  externalQuery?: string;
}

/**
 * AI Search Analyzer - Chat Interface
 *
 * Modern chat-style interface with Sidebar and Chat Window
 * Uses boxy centered design matching PrebuiltQueriesCard layout
 */
export function AISearchAnalyzer({
  apiKey,
  onSubmitRef,
  externalQuery,
}: AISearchAnalyzerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const [extractedQuery, setExtractedQuery] = useState<string>("");

  // Get the first user message as title
  const getFirstUserMessage = (msgs: Message[]): string => {
    const firstUserMsg = msgs.find((m) => m.role === "user");
    if (firstUserMsg) {
      // Truncate if too long
      return firstUserMsg.content.length > 50
        ? firstUserMsg.content.substring(0, 50) + "..."
        : firstUserMsg.content;
    }
    return "New Chat";
  };

  // Format date for history
  const formatHistoryDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  };

  // Handle new chat
  const handleNewChat = useCallback(() => {
    // Save current chat to history only if it has at least one user message
    // (This prevents empty chats from being saved)
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (firstUserMsg && messages.length > 0) {
      // Check if this session is already in history
      const existingIndex = history.findIndex(
        (h) => h.sessionId === currentSessionId,
      );

      if (existingIndex === -1) {
        // Only add to history if not already there
        const newHistoryItem: ChatHistory = {
          id: currentSessionId,
          title: getFirstUserMessage(messages),
          date: formatHistoryDate(firstUserMsg.timestamp),
          messages: [...messages],
          sessionId: currentSessionId,
        };
        setHistory((prev) => [newHistoryItem, ...prev]);
      }
    }

    // Clear messages and create new session
    setMessages([]);
    setExtractedQuery(""); // Clear extracted query on new chat
    setCurrentSessionId(
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    );
  }, [messages, currentSessionId, history]);

  // Handle history item click - restore the conversation
  const handleHistoryClick = useCallback(
    (historyItem: ChatHistory) => {
      // Save current chat to history if it has messages and is different
      const firstUserMsg = messages.find((m) => m.role === "user");
      if (
        firstUserMsg &&
        messages.length > 0 &&
        currentSessionId !== historyItem.sessionId
      ) {
        const existingIndex = history.findIndex(
          (h) => h.sessionId === currentSessionId,
        );

        if (existingIndex === -1) {
          const newHistoryItem: ChatHistory = {
            id: currentSessionId,
            title: getFirstUserMessage(messages),
            date: formatHistoryDate(firstUserMsg.timestamp),
            messages: [...messages],
            sessionId: currentSessionId,
          };
          setHistory((prev) => [newHistoryItem, ...prev]);
        }
      }

      // Restore the selected conversation
      setMessages([...historyItem.messages]);
      setCurrentSessionId(historyItem.sessionId);
      setExtractedQuery(""); // Clear extracted query when restoring a chat
    },
    [messages, currentSessionId, history],
  );

  // Update history when messages change (only for new messages, not when restoring)
  useEffect(() => {
    // When first user message is sent, update/create history entry
    // Skip if messages are empty (new chat) or if this is a restore operation
    if (messages.length > 0) {
      const firstUserMsg = messages.find((m) => m.role === "user");
      if (firstUserMsg) {
        setHistory((prev) => {
          // Check if this session already has a history entry
          const existingHistoryIndex = prev.findIndex(
            (h) => h.sessionId === currentSessionId,
          );

          if (existingHistoryIndex === -1) {
            // Create new history entry only if there's at least one user message
            const newHistoryItem: ChatHistory = {
              id: currentSessionId,
              title: getFirstUserMessage(messages),
              date: formatHistoryDate(firstUserMsg.timestamp),
              messages: [...messages],
              sessionId: currentSessionId,
            };
            return [newHistoryItem, ...prev];
          } else {
            // Update existing history entry (preserve original date when restoring)
            const updated = [...prev];
            const existingItem = updated[existingHistoryIndex];
            updated[existingHistoryIndex] = {
              ...existingItem,
              title: getFirstUserMessage(messages),
              messages: [...messages],
              // Keep original date if restoring, otherwise update
              date:
                existingItem.date || formatHistoryDate(firstUserMsg.timestamp),
            };
            return updated;
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentSessionId]); // getFirstUserMessage and formatHistoryDate are stable

  return (
    <>
      <div
        style={{
          width: "100%",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          minHeight: "calc(100vh - 200px)",
          padding: "24px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
            padding: "0 24px",
            display: "flex",
            flexDirection: "row",
            gap: "24px",
          }}
        >
          {/* Sidebar */}
          <Sidebar
            history={history}
            onNewChat={handleNewChat}
            onHistoryClick={handleHistoryClick}
          />

          {/* Chat Window */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                border: "1px solid #e1e3e5",
                overflow: "hidden",
                height: "600px",
                position: "relative",
              }}
            >
              <ChatWindow
                apiKey={apiKey}
                onSubmitRef={onSubmitRef}
                externalQuery={externalQuery}
                messages={messages}
                setMessages={setMessages}
                sessionId={currentSessionId}
                onQueryExtracted={setExtractedQuery}
              />
            </div>
          </div>
        </div>
      </div>

      {/* <div
        style={{
          width: "100%",
          backgroundColor: "#f9fafb",
          borderRadius: "12px",
          minHeight: "calc(100vh - 200px)",
          padding: "24px 0",
        }}
      > */}
      {/* <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
            padding: "0 24px",
            display: "flex",
            flexDirection: "row",
            gap: "24px",
          }}
        ></div> */}
      {/* GraphQL Preview Panel - Separate Box (only show when query exists) */}
      {extractedQuery && extractedQuery.trim() && (
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
            padding: "0 24px",
            marginTop: "24px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              border: "1px solid #e1e3e5",
              overflow: "hidden",
              height: "600px",
              position: "relative",
            }}
          >
            <GraphQLPreviewPanel externalQuery={extractedQuery} />
          </div>
        </div>
      )}
      {/* </div> */}
    </>
  );
}
