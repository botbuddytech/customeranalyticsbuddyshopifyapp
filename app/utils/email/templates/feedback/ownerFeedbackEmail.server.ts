import type { FeedbackCategoryType } from "../../../../components/home/feedback/feedbackCategories";
import { feedbackCategoryLabels } from "../../../../components/home/feedback/feedbackCategories";

export interface OwnerFeedbackEmailParams {
  shop: string;
  userEmail: string;
  category: FeedbackCategoryType;
  message: string;
}

export function buildOwnerFeedbackEmail(params: OwnerFeedbackEmailParams) {
  const categoryLabel = feedbackCategoryLabels[params.category];

  const subject = `[Feedback] ${categoryLabel} from ${params.userEmail} (${params.shop})`;

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #111827; line-height: 1.6;">
      <h2 style="font-size: 18px; margin-bottom: 12px;">New feedback from your Shopify app</h2>
      <p style="margin-bottom: 4px;"><strong>Shop:</strong> ${params.shop}</p>
      <p style="margin-bottom: 4px;"><strong>User email:</strong> ${params.userEmail}</p>
      <p style="margin-bottom: 12px;"><strong>Type:</strong> ${categoryLabel}</p>
      <div style="padding: 12px 16px; border-radius: 8px; background: #F9FAFB; border: 1px solid #E5E7EB;">
        <p style="white-space: pre-wrap; margin: 0;">${params.message}</p>
      </div>
    </div>
  `;

  const text = `New feedback from your Shopify app

Shop: ${params.shop}
User email: ${params.userEmail}
Type: ${categoryLabel}

Message:
${params.message}`;

  return { subject, html, text };
}


