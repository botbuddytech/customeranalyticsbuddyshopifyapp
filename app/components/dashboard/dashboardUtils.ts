/**
 * Shared utility functions for dashboard components
 */

/**
 * Generate mini chart data for trend visualization
 */
export function generateMiniChartData(value: number, trend: "up" | "down" | "stable" = "up") {
  const baseData = [value * 0.7, value * 0.8, value * 0.75, value * 0.9];

  if (trend === "up") {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{
        data: [...baseData, value * 0.95, value],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      }],
    };
  } else if (trend === "down") {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{
        data: [value * 1.3, value * 1.2, value * 1.1, value * 1.05, value * 1.02, value],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      }],
    };
  } else {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{
        data: [value * 0.95, value * 1.05, value * 0.98, value * 1.02, value * 0.99, value],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      }],
    };
  }
}

/**
 * Get growth indicator text
 */
export function getGrowthIndicator(cardTitle: string): string {
  switch (cardTitle) {
    case "Total Customers":
      return "↑ 25% growth in the last 6 months";
    case "New Customers":
      return "↑ 33% increase from January";
    case "Returning Customers":
      return "↑ 25% higher retention rate";
    case "Inactive Customers":
      return "↓ 9% decrease since January";
    case "COD Orders":
      return "↑ 25% increase in 6 months";
    case "Prepaid Orders":
      return "↑ 25% growth since January";
    case "Cancelled Orders":
      return "↓ 17% decrease in cancellations";
    case "Abandoned Carts":
      return "↓ 17% reduction in cart abandonment";
    case "Discount Users":
      return "↑ 25% more coupon usage";
    case "Wishlist Users":
      return "↑ 40% growth in wishlist usage";
    case "Reviewers":
      return "↑ 67% more customer reviews";
    case "Email Subscribers":
      return "↑ 18% growth in subscribers";
    case "Morning Purchases":
      return "↑ 25% increase in morning sales";
    case "Afternoon Purchases":
      return "↑ 25% growth in afternoon orders";
    case "Evening Purchases":
      return "↑ 25% more evening shoppers";
    case "Weekend Purchases":
      return "↑ 18% increase in weekend sales";
    default:
      return "↑ 25% growth in the last 6 months";
  }
}

/**
 * Get growth tone
 */
export function getGrowthTone(cardTitle: string): "success" | "subdued" | "critical" {
  if (cardTitle === "Inactive Customers" || cardTitle === "Cancelled Orders" || cardTitle === "Abandoned Carts") {
    return "success";
  }
  if (cardTitle === "Discount Users") {
    return "subdued";
  }
  return "success";
}

/**
 * Mini chart options
 */
export const miniChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  elements: {
    line: { tension: 0.4 },
    point: { radius: 0 },
  },
};

