import React, { useRef, useState, useEffect } from "react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: (overrideInput?: string) => void;
  isUserTypingRef: React.MutableRefObject<boolean>;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  inputWrapperRef: React.RefObject<HTMLTextAreaElement>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  onSend,
  isUserTypingRef,
  onSubmitRef,
  inputWrapperRef,
}) => {
  const [inputFocused, setInputFocused] = useState(false);

  // Expose handleSubmit via ref if provided
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = () => onSend();
    }
  }, [onSend, onSubmitRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      isUserTypingRef.current = false;
      onSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    isUserTypingRef.current = true;
    setInput(e.target.value);
    // Reset the flag after a delay
    setTimeout(() => {
      isUserTypingRef.current = false;
    }, 1000);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: "17px",
        padding: "16px",
        background: "white",
        borderTop: "1px solid #e1e3e5",
      }}
    >
      <div
        style={{
          maxWidth: "768px",
          margin: "0 auto",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            position: "relative",
            backgroundColor: "#f6f6f7",
            borderRadius: "16px",
            border: `1px solid ${inputFocused ? "#008060" : "#babfc3"}`,
            boxShadow: inputFocused
              ? "0 0 0 1px #008060"
              : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s",
          }}
        >
          <textarea
            ref={inputWrapperRef}
            rows={1}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setInputFocused(true);
              isUserTypingRef.current = true;
            }}
            onBlur={() => {
              setInputFocused(false);
              setTimeout(() => {
                isUserTypingRef.current = false;
              }, 200);
            }}
            placeholder="Ask about your customers..."
            disabled={isLoading}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "16px",
              padding: "16px 20px",
              paddingRight: "120px",
              fontSize: "15px",
              resize: "none",
              overflow: "hidden",
              minHeight: "56px",
              maxHeight: "200px",
              opacity: isLoading ? 0.5 : 1,
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "12px",
              bottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "4px",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: "white",
                border: "1px solid #e1e3e5",
                fontSize: "11px",
                fontWeight: "500",
                color: "#6d7175",
                cursor: "help",
              }}
            >
              <span style={{ opacity: 0.6 }}>⌘</span> <span>↵</span>
            </div>
            <button
              disabled={!input.trim() || isLoading}
              onClick={() => onSend()}
              style={{
                padding: "8px",
                borderRadius: "12px",
                transition: "all 0.2s",
                backgroundColor:
                  input.trim() && !isLoading ? "#008060" : "#e1e3e5",
                color: input.trim() && !isLoading ? "white" : "#babfc3",
                boxShadow:
                  input.trim() && !isLoading
                    ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                    : "none",
                border: "none",
                cursor:
                  input.trim() && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.backgroundColor = "#006e52";
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !isLoading) {
                  e.currentTarget.style.backgroundColor = "#008060";
                }
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
                  strokeWidth="2.5"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
