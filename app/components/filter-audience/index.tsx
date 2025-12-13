import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Layout, BlockStack, Grid } from "@shopify/polaris";
import { FilterSummaryCard } from "./FilterSummaryCard";
import { FilterSection } from "./FilterSection";
import { SegmentPreview } from "./SegmentPreview";
import { QuickActions } from "./QuickActions";
import { FilterTips } from "./FilterTips";
import { SegmentResultsModal } from "./SegmentResultsModal";
import { SaveListModal } from "./SaveListModal";
import { defaultFilterSections } from "./filterSections";
import type { FilterData, SegmentResults, FilterSection } from "./types";

interface AudienceFilterFormProps {
  onSubmit?: (filters: FilterData) => Promise<SegmentResults | null>;
  products?: string[];
  collections?: string[];
  categories?: string[];
  countries?: string[];
  paymentMethods?: string[];
  deliveryMethods?: string[];
  isLoading?: boolean;
  initialFilters?: FilterData | null;
  listId?: string | null;
  listName?: string;
}

/**
 * Main Audience Filter Form Component
 * 
 * Orchestrates all filter sections and handles form state
 */
export function AudienceFilterForm({
  onSubmit,
  products = [],
  collections = [],
  categories = [],
  countries = [],
  paymentMethods = [],
  deliveryMethods = [],
  isLoading = false,
  initialFilters = null,
  listId = null,
  listName = "",
}: AudienceFilterFormProps) {
  // State Management
  // Expand sections that have initial filters when modifying
  const getInitialExpandedSections = (): Record<string, boolean> => {
    if (!initialFilters) {
      return {
        location: true,
        products: false,
        timing: false,
        device: false,
        payment: false,
        delivery: false,
      };
    }
    
    return {
      location: (initialFilters.location?.length ?? 0) > 0 || true,
      products: (initialFilters.products?.length ?? 0) > 0 || false,
      timing: (initialFilters.timing?.length ?? 0) > 0 || false,
      device: (initialFilters.device?.length ?? 0) > 0 || false,
      payment: (initialFilters.payment?.length ?? 0) > 0 || false,
      delivery: (initialFilters.delivery?.length ?? 0) > 0 || false,
    };
  };

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(getInitialExpandedSections());

  const [selectedFilters, setSelectedFilters] = useState<FilterData>(
    initialFilters || {
      location: [],
      products: [],
      timing: [],
      device: [],
      payment: [],
      delivery: [],
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<SegmentResults | null>(null);
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [saveListError, setSaveListError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filterSections = useMemo((): FilterSection[] => {
    return defaultFilterSections.map((section) => {
      if (section.id === "products") {
        return {
          ...section,
          options: [...products, ...collections, ...categories],
        };
      }
      if (section.id === "location") {
        return { ...section, options: countries };
      }
      if (section.id === "payment") {
        const staticOptions = section.options || [];
        return {
          ...section,
          options: [
            ...staticOptions,
            ...paymentMethods.filter((method) => !staticOptions.includes(method)),
          ],
        };
      }
      if (section.id === "delivery") {
        const staticOptions = section.options || [];
        return {
          ...section,
          options: [
            ...staticOptions,
            ...deliveryMethods.filter((method) => !staticOptions.includes(method)),
          ],
        };
      }
      return section;
    });
  }, [products, collections, categories, countries, paymentMethods, deliveryMethods]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections({
      ...expandedSections,
      [sectionId]: !expandedSections[sectionId],
    });
  };

  // Handle filter checkbox changes
  const handleFilterChange = (
    sectionId: string,
    value: string,
    checked: boolean,
  ) => {
    setSelectedFilters((prev) => {
      const sectionFilters = prev[sectionId as keyof FilterData] || [];
      if (checked) {
        return {
          ...prev,
          [sectionId]: [...sectionFilters, value],
        };
      } else {
        return {
          ...prev,
          [sectionId]: sectionFilters.filter((item) => item !== value),
        };
      }
    });
  };

  const totalFiltersCount = useMemo(
    () =>
      Object.values(selectedFilters).reduce(
        (total, filters) => total + filters.length,
        0,
      ),
    [selectedFilters],
  );

  // Function to fetch preview count
  const fetchPreviewCount = useCallback(async (filters: FilterData) => {
    // If no filters selected, reset count
    const filterCount = Object.values(filters).reduce(
      (total, filterArray) => total + filterArray.length,
      0,
    );
    if (filterCount === 0) {
      setPreviewCount(0);
      setIsLoadingPreview(false);
      return;
    }

    setIsLoadingPreview(true);
    try {
      const formData = new FormData();
      formData.append("filters", JSON.stringify(filters));

      const response = await fetch("/api/filter-audience/generate-segment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
        setPreviewCount(0);
      } else if (data.success) {
        setPreviewCount(data.matchCount || 0);
      } else {
        setPreviewCount(0);
      }
    } catch (error) {
      console.error("Error fetching preview count:", error);
      setPreviewCount(0);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // Debounced effect to update preview count when filters change
  useEffect(() => {
    // Clear previous timeout
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    // Check if there are any filters selected
    const filterCount = Object.values(selectedFilters).reduce(
      (total, filterArray) => total + filterArray.length,
      0,
    );

    // If no filters, reset immediately without showing loader
    if (filterCount === 0) {
      setPreviewCount(0);
      setIsLoadingPreview(false);
      return;
    }

    // Show loader immediately when filters change
    setIsLoadingPreview(true);

    // Set new timeout to debounce the API call
    previewTimeoutRef.current = setTimeout(() => {
      fetchPreviewCount(selectedFilters);
    }, 500); // 500ms debounce delay

    // Cleanup function
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [selectedFilters, fetchPreviewCount]);

  // Handle form submission
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (totalFiltersCount === 0) {
      return;
    }

    // Open modal immediately with loading state
    setShowResultsModal(true);
    setResults(null); // Clear previous results
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        const segmentResults = await onSubmit(selectedFilters);
        if (segmentResults) {
          setResults(segmentResults);
        }
      } else {
        // Call API to generate segment
        const formData = new FormData();
        formData.append("filters", JSON.stringify(selectedFilters));

        const response = await fetch("/api/filter-audience/generate-segment", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
          const errorResults: SegmentResults = {
            matchCount: 0,
            filters: selectedFilters,
            error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED",
          };
          setResults(errorResults);
          setShowResultsModal(true);
        } else if (data.success) {
          const segmentResults: SegmentResults = {
            matchCount: data.matchCount,
            filters: data.filters,
            customers: data.customers || [],
          };
          setResults(segmentResults);
          // Update preview count
          setPreviewCount(data.matchCount);
          // Show results modal
          setShowResultsModal(true);
        } else {
          const errorResults: SegmentResults = {
            matchCount: 0,
            filters: selectedFilters,
            error: data.error || "Failed to generate segment",
          };
          setResults(errorResults);
          setShowResultsModal(true);
        }
      }
    } catch (error) {
      console.error("Error generating segment:", error);
      const errorResults: SegmentResults = {
        matchCount: 0,
        filters: selectedFilters,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      setResults(errorResults);
      setShowResultsModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clear all filters
  const handleClearAll = () => {
    setSelectedFilters({
      location: [],
      products: [],
      timing: [],
      device: [],
      payment: [],
      delivery: [],
    });
    setResults(null);
    setPreviewCount(0);
  };

  // Helper to ensure results exist, generate if needed
  const ensureResults = async (): Promise<SegmentResults | null> => {
    if (results && results.customers && results.customers.length > 0) {
      return results;
    }

    if (totalFiltersCount === 0) {
      return null;
    }

    // Generate segment silently (without showing modal)
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("filters", JSON.stringify(selectedFilters));

      const response = await fetch("/api/filter-audience/generate-segment", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error === "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED") {
        return {
          matchCount: 0,
          filters: selectedFilters,
          error: "PROTECTED_CUSTOMER_DATA_ACCESS_DENIED",
        };
      } else if (data.success) {
        const segmentResults: SegmentResults = {
          matchCount: data.matchCount,
          filters: data.filters,
          customers: data.customers || [],
        };
        setResults(segmentResults);
        setPreviewCount(data.matchCount);
        return segmentResults;
      } else {
        return {
          matchCount: 0,
          filters: selectedFilters,
          error: data.error || "Failed to generate segment",
        };
      }
    } catch (error) {
      console.error("Error generating segment:", error);
      return {
        matchCount: 0,
        filters: selectedFilters,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export handlers
  const handleExportPDF = async () => {
    const segmentResults = await ensureResults();
    if (!segmentResults?.customers || segmentResults.customers.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      // Create a simple HTML table and print it as PDF
      const headers = [
        "Name",
        "Email",
        "Country",
        "Created Date",
        "Orders",
        "Total Spent",
      ];

      let htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Customer Segment Export</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr:nth-child(even) { background-color: #f9f9f9; }
            </style>
          </head>
          <body>
            <h1>Customer Segment Export</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Total Customers: ${segmentResults.matchCount}</p>
            <table>
              <thead>
                <tr>
                  ${headers.map((h) => `<th>${h}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${segmentResults.customers
                  .map(
                    (customer) => `
                  <tr>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.country}</td>
                    <td>${customer.createdAt}</td>
                    <td>${customer.numberOfOrders}</td>
                    <td>${customer.totalSpent}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Download as HTML file (user can open and save as PDF from browser)
      // For a true PDF, we would need a library like jsPDF
      const blob = new Blob([htmlContent], { type: "text/html" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `customer-segment-${new Date().toISOString().split("T")[0]}.html`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Small delay to ensure download starts before revoking URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    const segmentResults = await ensureResults();
    if (!segmentResults?.customers || segmentResults.customers.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      const headers = [
        "Name",
        "Email",
        "Country",
        "Created Date",
        "Orders",
        "Total Spent",
      ];
      const csvRows = [
        headers.join(","),
        ...segmentResults.customers.map((customer) =>
          [
            `"${customer.name.replace(/"/g, '""')}"`,
            `"${customer.email.replace(/"/g, '""')}"`,
            `"${customer.country.replace(/"/g, '""')}"`,
            `"${customer.createdAt}"`,
            customer.numberOfOrders.toString(),
            `"${customer.totalSpent}"`,
          ].join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `customer-segment-${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    const segmentResults = await ensureResults();
    if (!segmentResults?.customers || segmentResults.customers.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      // Create CSV format (Excel can open CSV files)
      const headers = [
        "Name",
        "Email",
        "Country",
        "Created Date",
        "Orders",
        "Total Spent",
      ];
      const csvRows = [
        headers.join(","),
        ...segmentResults.customers.map((customer) =>
          [
            `"${customer.name.replace(/"/g, '""')}"`,
            `"${customer.email.replace(/"/g, '""')}"`,
            `"${customer.country.replace(/"/g, '""')}"`,
            `"${customer.createdAt}"`,
            customer.numberOfOrders.toString(),
            `"${customer.totalSpent}"`,
          ].join(","),
        ),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `customer-segment-${new Date().toISOString().split("T")[0]}.xls`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateCampaign = () => {
    // No functionality for now - placeholder
    console.log("Create campaign:", results);
  };

  const handleSaveToList = async () => {
    // If modifying, open modal directly with pre-filled name
    if (listId) {
      setSaveListError(null);
      setShowSaveListModal(true);
      return;
    }

    // If creating new, ensure results exist first
    const segmentResults = await ensureResults();
    if (segmentResults && segmentResults.customers && segmentResults.customers.length > 0) {
      setSaveListError(null);
      setShowSaveListModal(true);
    }
  };


  // Handle save list
  const handleSaveList = () => {
    if (!results || !results.customers || results.customers.length === 0) {
      return;
    }
    setSaveListError(null);
    setShowSaveListModal(true);
  };

  // Handle save list submission
  const handleSaveListSubmit = async (listName: string) => {
    setIsSavingList(true);
    setSaveListError(null);

    try {
      // Generate segment first if not already done
      let segmentResults = results;
      if (!segmentResults) {
        // If modifying, we can save without generating segment (just save the filters)
        // But if creating new, we need to generate segment first
        if (!listId) {
          const segmentData = await ensureResults();
          if (segmentData) {
            segmentResults = segmentData;
          } else {
            setSaveListError("Please generate a segment first");
            setIsSavingList(false);
            return;
          }
        } else {
          // When modifying, create a minimal result object with just filters
          segmentResults = {
            matchCount: 0,
            filters: selectedFilters,
            customers: [],
          };
        }
      }

      const formData = new FormData();
      formData.append("listName", listName);
      formData.append("filters", JSON.stringify(segmentResults.filters));
      formData.append("source", "filter-audience"); // Mark as saved from Filter Audience
      
      // If modifying, include listId
      if (listId) {
        formData.append("listId", listId);
      }
      
      // Optionally include customer IDs for quick access
      if (segmentResults.customers && segmentResults.customers.length > 0) {
        const customerIds = segmentResults.customers.map((c) => c.id);
        formData.append("customerIds", JSON.stringify(customerIds));
      }

      const response = await fetch("/api/filter-audience/save-list", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setSaveListError(data.error);
        setIsSavingList(false);
        return;
      }

      if (data.success) {
        // Close the save modal on success
        setShowSaveListModal(false);
        setSaveListError(null);
        // If modifying, redirect back to saved lists page
        if (listId) {
          window.location.href = "/app/my-saved-lists";
        }
        // You could show a success toast here
        console.log("List saved successfully:", data.list);
      }
    } catch (error) {
      console.error("Error saving list:", error);
      setSaveListError(
        error instanceof Error ? error.message : "Failed to save list"
      );
    } finally {
      setIsSavingList(false);
    }
  };

  return (
    <>
      <Layout>
        {/* Left Column: Filter Sections */}
        <Layout.Section>
          <BlockStack gap="400">
            <FilterSummaryCard
              totalFiltersCount={totalFiltersCount}
              onClearAll={handleClearAll}
              onSubmit={() => handleSubmit()}
              isSubmitting={isSubmitting}
            />

            {/* Render all filter sections */}
            {filterSections.map((section) => {
              if (section.id === "payment" || section.id === "delivery") {
                return null;
              }

              return (
                <FilterSection
                  key={section.id}
                  section={section}
                  selectedFilters={
                    selectedFilters[section.id as keyof FilterData] || []
                  }
                  isExpanded={expandedSections[section.id] || false}
                  onToggle={() => toggleSection(section.id)}
                  onFilterChange={(value, checked) =>
                    handleFilterChange(section.id, value, checked)
                  }
                  isLoading={isLoading}
                />
              );
            })}

            <Grid>
              {(() => {
                const paymentSection = filterSections.find(
                  (s) => s.id === "payment",
                );
                const deliverySection = filterSections.find(
                  (s) => s.id === "delivery",
                );

                return (
                  <>
                    {paymentSection && (
                      <Grid.Cell
                        columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}
                      >
                        <FilterSection
                          section={paymentSection}
                          selectedFilters={selectedFilters.payment || []}
                          isExpanded={expandedSections.payment || false}
                          onToggle={() => toggleSection("payment")}
                          onFilterChange={(value, checked) =>
                            handleFilterChange("payment", value, checked)
                          }
                          isLoading={isLoading}
                        />
                      </Grid.Cell>
                    )}

                    {deliverySection && (
                      <Grid.Cell
                        columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}
                      >
                        <FilterSection
                          section={deliverySection}
                          selectedFilters={selectedFilters.delivery || []}
                          isExpanded={expandedSections.delivery || false}
                          onToggle={() => toggleSection("delivery")}
                          onFilterChange={(value, checked) =>
                            handleFilterChange("delivery", value, checked)
                          }
                          isLoading={isLoading}
                        />
                      </Grid.Cell>
                    )}
                  </>
                );
              })()}
            </Grid>
          </BlockStack>
        </Layout.Section>

        {/* Right Column: Preview & Actions */}
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <SegmentPreview previewCount={previewCount} isLoading={isLoadingPreview} />
            <QuickActions
              hasResults={totalFiltersCount > 0}
              isExporting={isExporting}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              onExportExcel={handleExportExcel}
              onCreateCampaign={handleCreateCampaign}
              onSaveToList={handleSaveToList}
              onExportStart={() => setIsExporting(true)}
            />
            <FilterTips />
          </BlockStack>
        </Layout.Section>
      </Layout>

      {/* Results Modal */}
      <SegmentResultsModal
        open={showResultsModal}
        onClose={() => {
          setShowResultsModal(false);
          setResults(null); // Clear results when modal closes
        }}
        results={results}
        isLoading={isSubmitting}
        isExporting={isExporting}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        onExportExcel={handleExportExcel}
        onCreateCampaign={() => console.log("Create campaign:", results)}
        onSaveList={handleSaveList}
        onExportStart={() => setIsExporting(true)}
      />

      {/* Save List Modal */}
      <SaveListModal
        open={showSaveListModal}
        onClose={() => {
          setShowSaveListModal(false);
          setSaveListError(null);
        }}
        onSave={handleSaveListSubmit}
        isLoading={isSavingList}
        error={saveListError}
        initialListName={listName}
        isModify={!!listId}
      />

    </>
  );
}

