export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: {
    explanation?: string;
    results?: any[];
    tableRows?: (string | number)[][];
  };
}

