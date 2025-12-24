export type FeedbackCategoryType = "bug" | "feature" | "improvement" | "general";

export interface FeedbackCategory {
  type: FeedbackCategoryType;
  title: string;
  icon: string;
  buttonText: string;
}

export const feedbackCategoryLabels: Record<FeedbackCategoryType, string> = {
  bug: "Report a Bug",
  feature: "Request Feature",
  improvement: "Suggest Improvement",
  general: "General Feedback",
};

