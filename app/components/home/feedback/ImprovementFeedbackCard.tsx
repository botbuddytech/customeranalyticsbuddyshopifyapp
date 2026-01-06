import type { FeedbackCategoryType } from "./feedbackCategories";
import { FeedbackCategoryCard } from "./FeedbackCategoryCard";

interface ImprovementFeedbackCardProps {
  onClick: (type: FeedbackCategoryType) => void;
}

export function ImprovementFeedbackCard({
  onClick,
}: ImprovementFeedbackCardProps) {
  return (
    <FeedbackCategoryCard
      type="improvement"
      title="Suggest Improvement"
      icon="✨"
      buttonText="Share Idea"
      onClick={onClick}
    />
  );
}


