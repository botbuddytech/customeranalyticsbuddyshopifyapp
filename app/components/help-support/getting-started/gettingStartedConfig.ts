/**
 * Configuration for Getting Started section
 * 
 * Define the items to display in the Getting Started section
 * with their names and corresponding links
 */

export interface GettingStartedItem {
  name: string;
  link: string;
}

export const GETTING_STARTED_ITEMS: GettingStartedItem[] = [
  {
    name: "Complete the onboarding process",
    link: "https://www.customeranalyticsbuddy.com/documentation?topic=onboarding-steps",
  },
  {
    name: "Explore the dashboard",
    link: "https://www.customeranalyticsbuddy.com/documentation?topic=understanding-the-dashboard",
  },
  {
    name: "Try AI Search & Analyzer",
    link: "https://www.customeranalyticsbuddy.com/documentation?topic=ai-based-customer-list-generation",
  },
  {
    name: "Create your first customer segment",
    link: "https://www.customeranalyticsbuddy.com/documentation?topic=create-first-customer-segment",
  },
];

