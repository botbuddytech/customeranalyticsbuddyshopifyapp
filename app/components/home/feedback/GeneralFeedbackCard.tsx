import type { FeedbackCategoryType } from "./feedbackCategories";
import { FeedbackCategoryCard } from "./FeedbackCategoryCard";

interface GeneralFeedbackCardProps {
  onClick: (type: FeedbackCategoryType) => void;
}

export function GeneralFeedbackCard({ onClick }: GeneralFeedbackCardProps) {
  return (
    <FeedbackCategoryCard
      type="general"
      title="General Feedback"
      icon="💬"
      buttonText="Give Feedback"
      onClick={onClick}
    />
  );
}


