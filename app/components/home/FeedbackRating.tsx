import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { Card, BlockStack, Text, Grid, Toast } from "@shopify/polaris";
import type { FeedbackCategoryType } from "./feedback/feedbackCategories";
import { FeedbackForm } from "./feedback/FeedbackForm";
import { BugFeedbackCard } from "./feedback/BugFeedbackCard";
import { FeatureFeedbackCard } from "./feedback/FeatureFeedbackCard";
import { ImprovementFeedbackCard } from "./feedback/ImprovementFeedbackCard";
import { GeneralFeedbackCard } from "./feedback/GeneralFeedbackCard";

export function FeedbackRating() {
  const fetcher = useFetcher();
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<FeedbackCategoryType | null>(null);
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const isSubmitting = fetcher.state !== "idle";

  const handleFeedbackCategory = (type: FeedbackCategoryType) => {
    setSelectedCategory(type);
    // Open the feedback form for all categories
    setShowFeedbackForm(true);
  };

  const handleSubmitFeedback = () => {
    if (!selectedCategory || isSubmitting) return;

    fetcher.submit(
      {
        intent: "feedback",
        category: selectedCategory,
        email,
        message: feedbackText,
      },
      { method: "POST", encType: "application/json" },
    );
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      const data = fetcher.data as any;

      if (data.success) {
        setToastMessage("Thanks for your feedback!");
        setToastError(false);
        setToastActive(true);

        // Reset and close the modal on success
        setEmail("");
        setFeedbackText("");
        setSelectedCategory(null);
        setShowFeedbackForm(false);
      } else {
        setToastMessage(
          data.error || "Failed to send feedback. Please try again.",
        );
        setToastError(true);
        setToastActive(true);
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Card>
      <BlockStack gap="400">
        {toastActive && (
          <Toast
            content={toastMessage}
            error={toastError}
            onDismiss={() => setToastActive(false)}
          />
        )}

        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">
            Share Your Feedback
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            Help us improve your experience and rate the app
          </Text>
        </BlockStack>

        <BlockStack gap="300">
          {/* Feedback Categories */}
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <BugFeedbackCard onClick={handleFeedbackCategory} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <FeatureFeedbackCard onClick={handleFeedbackCategory} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <ImprovementFeedbackCard onClick={handleFeedbackCategory} />
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <GeneralFeedbackCard onClick={handleFeedbackCategory} />
            </Grid.Cell>
          </Grid>

          {/* Feedback Form */}
          <FeedbackForm
            open={showFeedbackForm}
            email={email}
            setEmail={setEmail}
            feedbackText={feedbackText}
            setFeedbackText={setFeedbackText}
            onCancel={() => setShowFeedbackForm(false)}
            onSubmit={handleSubmitFeedback}
            isSubmitting={isSubmitting}
          />
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
