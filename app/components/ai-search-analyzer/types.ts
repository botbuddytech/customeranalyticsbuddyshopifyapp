export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  query?: string; // GraphQL query associated with this message
  data?: {
    explanation?: string;
    results?: any[];
    tableRows?: (string | number)[][];
  };
}

