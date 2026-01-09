import type { DashboardCustomer } from "./DashboardSegmentModal";

/**
 * Shared export utility functions for dashboard components
 */

interface ExportOptions {
  customers: DashboardCustomer[];
  filename: string;
  title?: string;
}

/**
 * Export customers to CSV format
 */
export function exportToCSV({ customers, filename }: ExportOptions): void {
  if (!customers || customers.length === 0) {
    return;
  }

  const headers = ["Name", "Email", "Created Date", "Orders", "Total Spent"];

  const csvRows = [
    headers.join(","),
    ...customers.map((customer) =>
      [
        `"${(customer.name || "").replace(/"/g, '""')}"`,
        `"${(customer.email || "").replace(/"/g, '""')}"`,
        `"${customer.createdAt || ""}"`,
        (customer.numberOfOrders || 0).toString(),
        `"${customer.totalSpent || ""}"`,
      ].join(","),
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadFile(blob, `${filename}.csv`);
}

/**
 * Export customers to PDF format (as HTML that can be printed/saved as PDF)
 */
export function exportToPDF({ customers, filename, title = "Customer Export" }: ExportOptions): void {
  if (!customers || customers.length === 0) {
    return;
  }

  const headers = ["Name", "Email", "Created Date", "Orders", "Total Spent"];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
          }
          h1 { 
            color: #333; 
            margin-bottom: 10px;
          }
          .meta {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          @media print {
            body { margin: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">
          Generated: ${new Date().toLocaleString()}<br>
          Total Customers: ${customers.length}
        </div>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${customers
              .map(
                (customer) => `
              <tr>
                <td>${escapeHtml(customer.name || "")}</td>
                <td>${escapeHtml(customer.email || "")}</td>
                <td>${escapeHtml(customer.createdAt || "")}</td>
                <td>${customer.numberOfOrders || 0}</td>
                <td>${escapeHtml(customer.totalSpent || "")}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html" });
  downloadFile(blob, `${filename}.html`);
}

/**
 * Export customers to Excel format (as CSV with Excel MIME type)
 */
export function exportToExcel({ customers, filename }: ExportOptions): void {
  if (!customers || customers.length === 0) {
    return;
  }

  const headers = ["Name", "Email", "Created Date", "Orders", "Total Spent"];

  const csvRows = [
    headers.join(","),
    ...customers.map((customer) =>
      [
        `"${(customer.name || "").replace(/"/g, '""')}"`,
        `"${(customer.email || "").replace(/"/g, '""')}"`,
        `"${customer.createdAt || ""}"`,
        (customer.numberOfOrders || 0).toString(),
        `"${customer.totalSpent || ""}"`,
      ].join(","),
    ),
  ];

  const csvContent = csvRows.join("\n");
  // Use Excel MIME type so it opens in Excel
  const blob = new Blob([csvContent], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  downloadFile(blob, `${filename}.xls`);
}

/**
 * Helper function to download a file
 */
function downloadFile(blob: Blob, filename: string): void {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Helper function to escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
