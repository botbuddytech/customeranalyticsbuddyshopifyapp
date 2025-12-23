import { useState, useCallback, useEffect } from "react";
import { BlockStack } from "@shopify/polaris";
import { SearchQueryCard } from "./SearchQueryCard";
import { PrebuiltQueriesCard } from "./PrebuiltQueriesCard";
import { ProcessingStepsCard } from "./ProcessingStepsCard";
import { ResultsCard } from "./ResultsCard";

interface Customer {
  id: number;
  name: string;
  email: string;
  lastPurchaseDate: string;
  totalSpent: string;
  orderCount: number;
  [key: string]: string | number;
}

interface AISearchAnalyzerProps {
  apiKey: string;
}

/**
 * AI Search Analyzer
 *
 * Main component that orchestrates the search flow:
 * - Query input
 * - Prebuilt query suggestions
 * - Processing state
 * - Results display
 */
export function AISearchAnalyzer({ apiKey }: AISearchAnalyzerProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Customer[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [showPrebuiltQueries, setShowPrebuiltQueries] = useState(true);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [explanation, setExplanation] = useState("");

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;

    setIsLoading(true);
    setProcessingSteps([]);
    setExplanation("");
    setHasResults(false);
    setShowPrebuiltQueries(false);

    const steps = [
      "Understanding your question",
      "Identifying relevant customer attributes",
      "Querying your store data",
      "Analyzing results",
      "Finalizing response",
    ];

    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setProcessingSteps((prev) => [...prev, steps[currentStep]]);
        currentStep += 1;
      } else {
        clearInterval(stepInterval);
        generateMockResults(query);
      }
    }, 700);
  }, [query]);

  const generateMockResults = (rawQuery: string) => {
    const mockCustomers: Customer[] = [];
    const filter: any = {};
    const explanationParts: string[] = [];

    const lower = rawQuery.toLowerCase();

    if (lower.includes("best customers")) {
      filter.totalSpent = { gt: 500 };
      explanationParts.push("customers who have spent the most money");
    } else if (
      lower.includes("haven't ordered") ||
      lower.includes("inactive")
    ) {
      filter.lastPurchaseDate = { lt: "2023-01-01" };
      explanationParts.push("customers who haven't placed an order recently");
    } else if (lower.includes("new customers")) {
      filter.orderCount = { eq: 1 };
      explanationParts.push("customers who have only placed one order");
    } else if (lower.includes("loyal") || lower.includes("repeat")) {
      filter.orderCount = { gt: 3 };
      explanationParts.push("customers who have placed multiple orders");
    }

    if (lower.includes("90 days")) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      filter.lastPurchaseDate = { lt: cutoff.toISOString().split("T")[0] };
      explanationParts.push("haven't ordered in the last 90 days");
    }

    if (lower.includes("$1000")) {
      filter.totalSpent = { gt: 1000 };
      explanationParts.push("spent more than $1,000");
    }

    const explanationText =
      explanationParts.length > 0
        ? `I found ${explanationParts.join(" and ")}.`
        : "I analyzed all customers in your store.";

    for (let i = 1; i <= 10; i += 1) {
      const lastPurchaseDate = new Date();
      lastPurchaseDate.setDate(
        lastPurchaseDate.getDate() - Math.floor(Math.random() * 365),
      );

      mockCustomers.push({
        id: i,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        lastPurchaseDate: lastPurchaseDate.toISOString().split("T")[0],
        totalSpent: `$${(Math.random() * 2000).toFixed(2)}`,
        orderCount: Math.floor(Math.random() * 10) + 1,
      });
    }

    let filtered = mockCustomers;

    if (filter.totalSpent?.gt) {
      filtered = filtered.filter(
        (c) => parseFloat(c.totalSpent.replace("$", "")) > filter.totalSpent.gt,
      );
    }

    if (filter.orderCount?.gt) {
      filtered = filtered.filter((c) => c.orderCount > filter.orderCount.gt);
    }

    if (filter.orderCount?.eq) {
      filtered = filtered.filter((c) => c.orderCount === filter.orderCount.eq);
    }

    if (filter.lastPurchaseDate?.lt) {
      filtered = filtered.filter(
        (c) => c.lastPurchaseDate < filter.lastPurchaseDate.lt,
      );
    }

    setResults(filtered);
    setExplanation(explanationText);
    setIsLoading(false);
  };

  const tableRows = results.map((customer) => [
    customer.name,
    customer.email,
    customer.lastPurchaseDate,
    customer.totalSpent,
    customer.orderCount.toString(),
  ]);

  useEffect(() => {
    if (results.length > 0) {
      setHasResults(true);
    }
  }, [results]);

  return (
    <BlockStack gap="500">
      <SearchQueryCard
        query={query}
        isLoading={isLoading}
        onQueryChange={handleQueryChange}
        onSubmit={handleSubmit}
      />

      {showPrebuiltQueries && !isLoading && !hasResults && (
        <PrebuiltQueriesCard
          visible
          setQuery={setQuery}
          onSubmit={handleSubmit}
        />
      )}

      {isLoading && (
        <ProcessingStepsCard isLoading processingSteps={processingSteps} />
      )}

      {hasResults && (
        <ResultsCard
          hasResults={hasResults}
          explanation={explanation}
          rowCount={results.length}
          tableRows={tableRows}
        />
      )}
    </BlockStack>
  );
}
