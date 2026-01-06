import type { FeedbackCategoryType } from "../../../../components/home/feedback/feedbackCategories";
import { feedbackCategoryLabels } from "../../../../components/home/feedback/feedbackCategories";

export interface UserFeedbackEmailParams {
  category: FeedbackCategoryType;
  message: string;
  userEmail?: string;
}

export function buildUserFeedbackEmail(params: UserFeedbackEmailParams) {
  const categoryLabel = feedbackCategoryLabels[params.category];
  const subject = `Thanks for your ${categoryLabel}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thanks for Your Feedback</title>
    <style>
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .content-padding {
                padding: 20px 24px 24px !important;
            }
            .header-padding {
                padding: 24px 24px !important;
            }
            .footer-padding {
                padding: 20px 24px !important;
            }
            .feedback-box {
                padding: 16px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" class="email-container" style="max-width: 720px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    
                    <!-- Header with brand color -->
                    <tr>
                        <td class="header-padding" style="background: linear-gradient(135deg, #95bf47 0%, #7dab39 100%); padding: 28px 60px; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; letter-spacing: -0.5px;">
                                Thanks for Your Feedback!
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="content-padding" style="padding: 24px 60px 28px;">
                            <p style="margin: 0 0 14px; color: #4b5563; font-size: 16px; line-height: 1.5; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                                Hi,
                            </p>
                            
                            <p style="margin: 0 0 14px; color: #4b5563; font-size: 16px; line-height: 1.5; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                                We received your <strong>${categoryLabel.toLowerCase()}</strong> and really appreciate you taking the time to share your thoughts with us.
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.5; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                                Your input helps us build a better product for you and the entire BotBuddy community.
                            </p>
                            
                            <!-- Feedback Message Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 18px 0;">
                                <tr>
                                    <td class="feedback-box" style="padding: 18px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 8px; border-left: 4px solid #95bf47;">
                                        <p style="margin: 0 0 8px; color: #1e40af; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                                            Your Message:
                                        </p>
                                        <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.6; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; white-space: pre-wrap;">
                                            ${params.message}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 14px; color: #4b5563; font-size: 16px; line-height: 1.5; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                                Our team will carefully review your feedback and get back to you if we need any additional information or have updates to share.
                            </p>
                            
                            <p style="margin: 0 0 18px; color: #4b5563; font-size: 15px; line-height: 1.4; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                                Thanks again,<br>
                                The BotBuddy Team
                            </p>
                            
                            <!-- Appreciation Notice -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 16px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.4; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                                            💡 <strong>Have more ideas?</strong> We're always listening! Feel free to share additional feedback anytime through the app or by replying to this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer-padding" style="background-color: #111827; padding: 20px 60px; text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 13px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.3;">
                                You're receiving this email because you submitted feedback in BotBuddy.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const text = `Thanks for Your Feedback!

Hi,

We received your ${categoryLabel.toLowerCase()} and really appreciate you taking the time to share your thoughts with us.

Your input helps us build a better product for you and the entire BotBuddy community.

Your Message:
${params.message}

Our team will carefully review your feedback and get back to you if we need any additional information or have updates to share.

Thanks again,
The BotBuddy Team

---
💡 Have more ideas? We're always listening! Feel free to share additional feedback anytime through the app or by replying to this email.

You're receiving this email because you submitted feedback in BotBuddy.`;

  return { subject, html, text };
}