import type { FilterSection } from "./types";

export const defaultFilterSections: FilterSection[] = [
  {
    id: "location",
    title: "Geographic Location",
    emoji: "🌍",
    options: [],
  },
  {
    id: "products",
    title: "Product Categories",
    emoji: "🛍️",
    options: [],
  },
  {
    id: "timing",
    title: "Shopping Timing",
    emoji: "⏰",
    options: [
      "Morning (6am-12pm)",
      "Afternoon (12pm-6pm)",
      "Evening (6pm-12am)",
      "Night (12am-6am)",
      "Weekdays",
      "Weekends",
      "Holidays - to be fixed",
    ],
  },
  {
    id: "payment",
    title: "Payment Methods",
    emoji: "💳",
    options: ["Prepaid"],
  },
  {
    id: "delivery",
    title: "Delivery Preferences",
    emoji: "🚚",
    options: [
      "Standard Shipping",
      "Express Shipping",
      "Free Shipping",
      "Local Pickup",
      "Same-day Delivery",
      "International Shipping",
      "Scheduled Delivery",
      "Eco-friendly Packaging",
    ],
  },
];

