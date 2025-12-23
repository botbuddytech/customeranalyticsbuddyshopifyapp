export interface SubscriptionPlan {
    id: string;
    name: string;
    price: string;
    priceNote: string;
    description: string;
    features: string[];
    badge?: {
      tone: "success" | "attention" | "info";
      label: string;
    };
    primaryCtaLabel: string;
    primaryCtaVariant: "primary" | "secondary" | "plain";
    isCurrent?: boolean;
  }
  
  export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      priceNote: "Free forever · Billed via Shopify",
      description:
        "For new stores exploring customer analytics with limited historical data.",
      features: [
        "Access to last 60 days of store data only",
        "Core analytics dashboards",
        "Basic customer insights",
        "Standard email support",
        "No AI-powered analytics",
      ],
      badge: { tone: "info", label: "Free plan" },
      primaryCtaLabel: "Current plan",
      primaryCtaVariant: "secondary",
      isCurrent: true,
    },
    {
      id: "paid",
      name: "Growth",
      price: "$79",
      priceNote: "per month · Billed via Shopify",
      description:
        "For growing brands that need full historical analytics, AI insights, and priority support.",
      features: [
        "Access to complete store data (no time limits)",
        "Advanced analytics across all historical data",
        "AI-powered data querying and insights",
        "Ask AI questions and get results from your database",
        "Personalized support team",
        "Priority assistance",
      ],
      badge: { tone: "attention", label: "Recommended" },
      primaryCtaLabel: "Upgrade via Shopify (coming soon)",
      primaryCtaVariant: "primary",
    },
  ];
  