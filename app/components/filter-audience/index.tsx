import { useState, useMemo } from "react";
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
}: AudienceFilterFormProps) {
  // State Management
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    location: true,
    products: false,
    timing: false,
    device: false,
    payment: false,
    delivery: false,
  });

  const [selectedFilters, setSelectedFilters] = useState<FilterData>({
    location: [],
    products: [],
    timing: [],
    device: [],
    payment: [],
    delivery: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<SegmentResults | null>(null);
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showSaveListModal, setShowSaveListModal] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [saveListError, setSaveListError] = useState<string | null>(null);

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

  // Handle export actions
  const handleExportSegment = () => {
    console.log("Export segment:", results);
    // TODO: Implement export functionality
  };

  const handleCreateCampaign = () => {
    console.log("Create campaign:", results);
    // TODO: Implement campaign creation
  };

  const handleSaveToList = () => {
    console.log("Save to list:", results);
    // TODO: Implement save to list functionality
  };

  const handleExportCSV = () => {
    console.log("Export CSV:", results);
    // TODO: Implement CSV export
  };

  const handleExportExcel = () => {
    console.log("Export Excel:", results);
    // TODO: Implement Excel export
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
    if (!results) {
      return;
    }

    setIsSavingList(true);
    setSaveListError(null);

    try {
      const formData = new FormData();
      formData.append("listName", listName);
      formData.append("filters", JSON.stringify(results.filters));
      formData.append("source", "filter-audience"); // Mark as saved from Filter Audience
      
      // Optionally include customer IDs for quick access
      if (results.customers && results.customers.length > 0) {
        const customerIds = results.customers.map((c) => c.id);
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
            <SegmentPreview previewCount={previewCount} />
            <QuickActions
              hasResults={!!results}
              onExportSegment={() => console.log("Export segment:", results)}
              onCreateCampaign={() => console.log("Create campaign:", results)}
              onSaveToList={() => console.log("Save to list:", results)}
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
        onExportCSV={() => console.log("Export CSV:", results)}
        onExportExcel={() => console.log("Export Excel:", results)}
        onCreateCampaign={() => console.log("Create campaign:", results)}
        onSaveList={handleSaveList}
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
      />
    </>
  );
}

