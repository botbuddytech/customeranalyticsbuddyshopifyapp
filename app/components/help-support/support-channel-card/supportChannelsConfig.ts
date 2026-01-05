/**
 * Configuration for Support Channels section
 * 
 * Define the support channels to display in the Need Help section
 */

import { SUPPORT_EMAIL, CALENDLY_URL } from "../constants";

export interface SupportChannel {
  title: string;
  description: string;
  buttonText: string;
  iconColor: string;
  onClick: () => void;
}

export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    title: "Chat with us Now",
    description: "Have questions? Our support team is here to help you get the most out of your features.",
    buttonText: "Start Chat",
    iconColor: "#008060", // Green for chat
    onClick: () => {
      // Integrate with your chat service (Intercom, Crisp, Zendesk, etc.)
      alert("Opening live chat... (integrate with your chat service)");
    },
  },
  {
    title: `Email us at ${SUPPORT_EMAIL}`,
    description: "Send us a detailed message",
    buttonText: "Email us",
    iconColor: "#0066CC", // Blue for email
    onClick: () => {
      window.open(`mailto:${SUPPORT_EMAIL}`, "_blank");
    },
  },
  {
    title: "Book a 30-min Call on Calendly",
    description: "Book a personalized demo",
    buttonText: "Book Call",
    iconColor: "#FFA500", // Orange/Gold for calendar
    onClick: () => {
      window.open(CALENDLY_URL, "_blank");
    },
  },
];

