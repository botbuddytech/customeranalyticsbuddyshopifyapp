export type EmailTemplateName = "generic" | "feedback";

export interface GenericTemplateVars {
  subject: string;
  html: string;
  text?: string;
}

export interface FeedbackTemplateVars {
  subject?: string;
  message: string;
}

export type TemplateVariablesMap = {
  generic: GenericTemplateVars;
  feedback: FeedbackTemplateVars;
};

export interface RenderedEmail {
  subject: string;
  html: string;
  text?: string;
}

export function renderTemplate<T extends EmailTemplateName>(
  template: T,
  vars: TemplateVariablesMap[T],
): RenderedEmail {
  switch (template) {
    case "generic": {
      const { subject, html, text } = vars as GenericTemplateVars;
      return {
        subject,
        html,
        text,
      };
    }
    case "feedback": {
      const { subject, message } = vars as FeedbackTemplateVars;
      const resolvedSubject = subject ?? "New feedback from your app";

      const html = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; color: #111827; line-height: 1.6;">
          <h2 style="font-size: 18px; margin-bottom: 12px;">New feedback received</h2>
          <p style="margin-bottom: 12px;">You just received new feedback from a user.</p>
          <div style="padding: 12px 16px; border-radius: 8px; background: #F9FAFB; border: 1px solid #E5E7EB;">
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
        </div>
      `;

      const text = `New feedback received:\n\n${message}`;

      return {
        subject: resolvedSubject,
        html,
        text,
      };
    }
    default: {
      // Exhaustive check
      const neverTemplate: never = template;
      throw new Error(`Unsupported email template: ${neverTemplate}`);
    }
  }
}


