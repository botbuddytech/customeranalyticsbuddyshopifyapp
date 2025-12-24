import nodemailer from "nodemailer";
import type {
  EmailTemplateName,
  TemplateVariablesMap,
} from "./emailTemplates.server";
import { renderTemplate } from "./emailTemplates.server";

const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

if (!gmailUser) {
  console.warn(
    "[email] GMAIL_USER is not set. Please set it to the Gmail address you want to send from.",
  );
}

if (!gmailAppPassword) {
  console.warn(
    "[email] GMAIL_APP_PASSWORD is not set. Email sending via Gmail will fail until it is configured.",
  );
}

const transporter =
  gmailUser && gmailAppPassword
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      })
    : null;

export type EmailRecipient = string | string[];

export interface SendTemplatedEmailOptions<T extends EmailTemplateName> {
  to: EmailRecipient;
  template: T;
  vars: TemplateVariablesMap[T];
  /**
   * Optional override for the "from" address.
   * Defaults to process.env.GMAIL_USER if not provided.
   */
  from?: string;
  /**
   * Optional reply-to address (e.g. user's email).
   */
  replyTo?: string | string[];
}

export interface SendRawEmailOptions {
  to: EmailRecipient;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
}

export async function sendTemplatedEmail<T extends EmailTemplateName>(
  options: SendTemplatedEmailOptions<T>,
) {
  if (!transporter) {
    throw new Error(
      "Cannot send email: Gmail transporter is not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD.",
    );
  }

  const fromAddress = options.from ?? gmailUser;
  if (!fromAddress) {
    throw new Error(
      "Cannot send email: no 'from' address configured. Set GMAIL_USER or pass `from` explicitly.",
    );
  }

  const rendered = renderTemplate(options.template, options.vars);

  const to = Array.isArray(options.to) ? options.to : [options.to];

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    replyTo: options.replyTo,
  });

  return info;
}

export async function sendRawEmail(options: SendRawEmailOptions) {
  if (!transporter) {
    throw new Error(
      "Cannot send email: Gmail transporter is not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD.",
    );
  }

  const fromAddress = options.from ?? gmailUser;
  if (!fromAddress) {
    throw new Error(
      "Cannot send email: no 'from' address configured. Set GMAIL_USER or pass `from` explicitly.",
    );
  }

  const to = Array.isArray(options.to) ? options.to : [options.to];

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });

  return info;
}



