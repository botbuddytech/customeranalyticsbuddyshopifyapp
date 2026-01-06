export interface Query {
  title: string;
  prompt: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  queries: Query[];
}

export const categories: Category[] = [
  {
    id: "segmentation",
    title: "🎯 Customer Segmentation",
    description:
      "Identify and group customers by value, behavior, and characteristics",
    queries: [
      {
        title: "💎 High-value customers ($1000+)",
        prompt: "Who are my high-value customers that have spent over $1000?",
      },
      {
        title: "🔄 Frequent buyers (5+ orders)",
        prompt: "Which customers have made more than 5 orders?",
      },
      {
        title: "✨ New customers (last 30 days)",
        prompt: "Who are my new customers from the last 30 days?",
      },
      // {
      //   title: "👑 VIP customers (highest LTV)",
      //   prompt:
      //     "Which customers are my VIP members with highest lifetime value?",
      // },
      // {
      //   title: "🎯 One-time buyers (conversion potential)",
      //   prompt:
      //     "Who are my one-time buyers that could become repeat customers?",
      // },
    ],
  },
  {
    id: "behavior",
    title: "📊 Behavior Analysis",
    description:
      "Understand customer patterns, engagement, and shopping habits",
    queries: [
      {
        title: "😴 Inactive customers (90+ days)",
        prompt: "Which customers haven't ordered in the last 90 days?",
      },
      {
        title: "🔄 Monthly repeat buyers",
        prompt:
          "Who are my repeat customers that order at least once a month?",
      },
      {
        title: "🛒 Recent cart abandoners",
        prompt: "Which customers have abandoned their carts recently?",
      },
      // {
      //   title: "🎄 Seasonal shoppers",
      //   prompt: "Who are my seasonal shoppers that only buy during holidays?",
      // },
      // {
      //   title: "👀 High browsers, low buyers",
      //   prompt: "Which customers browse frequently but rarely purchase?",
      // },
    ],
  },
  {
    id: "revenue",
    title: "💰 Revenue & ROI",
    description:
      "Analyze revenue patterns, profitability, and return on investment",
    queries: [
      {
        title: "📈 Highest profit margin customers",
        prompt: "Which customers generate the highest profit margins?",
      },
      {
        title: "📉 Declining spend customers",
        prompt: "Who are my customers with declining purchase amounts?",
      },
      {
        title: "🎯 Best marketing ROI customers",
        prompt:
          "Which customers have the best return on marketing investment?",
      },
      // {
      //   title: "💎 Premium product buyers",
      //   prompt:
      //     "Who are my customers that buy premium products consistently?",
      // },
      // {
      //   title: "📊 Growing spend customers",
      //   prompt: "Which customers have increased their spending over time?",
      // },
    ],
  },
  {
    id: "predictive",
    title: "🔮 Predictive Analysis",
    description: "Forecast future behavior and identify at-risk customers",
    queries: [
      {
        title: "⚠️ Churn risk customers",
        prompt:
          "Which customers are at risk of churning based on their behavior?",
      },
      {
        title: "🎯 Ready-to-buy customers",
        prompt:
          "Who are my customers likely to make their next purchase soon?",
      },
      {
        title: "⬆️ Upselling candidates",
        prompt:
          "Which customers might be interested in upselling opportunities?",
      },
      // {
      //   title: "🔄 Cross-selling opportunities",
      //   prompt: "Who are my customers with potential for cross-selling?",
      // },
      // {
      //   title: "🌟 Future brand advocates",
      //   prompt: "Which customers are likely to become brand advocates?",
      // },
    ],
  },
];

