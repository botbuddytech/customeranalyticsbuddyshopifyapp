import type { FeedbackCategoryType } from "./feedbackCategories";
import { FeedbackCategoryCard } from "./FeedbackCategoryCard";

interface BugFeedbackCardProps {
  onClick: (type: FeedbackCategoryType) => void;
}

export function BugFeedbackCard({ onClick }: BugFeedbackCardProps) {
  return (
    <FeedbackCategoryCard
      type="bug"
      title="Report a Bug"
      icon="🐛"
      buttonText="Report Issue"
      onClick={onClick}
    />
  );
}


