import type { FeedbackCategoryType } from "./feedbackCategories";
import { FeedbackCategoryCard } from "./FeedbackCategoryCard";

interface FeatureFeedbackCardProps {
  onClick: (type: FeedbackCategoryType) => void;
}

export function FeatureFeedbackCard({ onClick }: FeatureFeedbackCardProps) {
  return (
    <FeedbackCategoryCard
      type="feature"
      title="Request Feature"
      icon="💡"
      buttonText="Suggest Feature"
      onClick={onClick}
    />
  );
}


