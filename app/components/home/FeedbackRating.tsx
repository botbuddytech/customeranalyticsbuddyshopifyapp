import { useState } from "react";
import { Card, BlockStack, InlineStack, Text, Box, Button, Grid } from "@shopify/polaris";

/**
 * Feedback and Rating Component
 * 
 * Star rating system with feedback categories and submission form
 */
export function FeedbackRating() {
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const feedbackCategories = [
    {
      type: 'bug',
      title: 'Report a Bug',
      icon: '🐛',
      buttonText: 'Report Issue'
    },
    {
      type: 'feature',
      title: 'Request Feature',
      icon: '💡',
      buttonText: 'Suggest Feature'
    },
    {
      type: 'improvement',
      title: 'Suggest Improvement',
      icon: '✨',
      buttonText: 'Share Idea'
    },
    {
      type: 'general',
      title: 'General Feedback',
      icon: '💬',
      buttonText: 'Give Feedback'
    }
  ];

  const handleStarRating = (rating: number) => {
    setCurrentRating(rating);
  };

  const handleFeedbackCategory = (type: string) => {
    setShowFeedbackForm(true);
  };

  const handleSubmitFeedback = () => {
    alert(`Thank you for your ${currentRating > 0 ? `${currentRating}-star ` : ''}feedback! We'll review it and get back to you.`);
    setFeedbackText('');
    setShowFeedbackForm(false);
    setCurrentRating(0);
  };

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd">
            Share Your Feedback
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            Help us improve your experience and rate the app
          </Text>
        </BlockStack>

        <BlockStack gap="300">
          {/* Rating System */}
          <Box
            padding="400"
            background="bg-surface-secondary"
            borderRadius="200"
            borderWidth="025"
            borderColor="border"
          >
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                How would you rate your experience?
              </Text>
              
              <InlineStack gap="200" align="center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="plain"
                    onClick={() => handleStarRating(star)}
                    accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    {star <= currentRating ? '⭐' : '☆'}
                  </Button>
                ))}
                <Text as="span" variant="bodyMd" tone="subdued">
                  {currentRating > 0 ? `${currentRating}/5` : 'Rate us'}
                </Text>
              </InlineStack>
            </BlockStack>
          </Box>

          {/* Feedback Categories */}
          <Grid>
            {feedbackCategories.map((category, index) => (
              <Grid.Cell
                key={index}
                columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}
              >
                <Card>
                  <BlockStack gap="300">
                    <InlineStack gap="200" align="center">
                      <Text as="span" variant="headingMd">{category.icon}</Text>
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {category.title}
                      </Text>
                    </InlineStack>
                    
                    <Button
                      variant="secondary"
                      onClick={() => handleFeedbackCategory(category.type)}
                      fullWidth
                    >
                      {category.buttonText}
                    </Button>
                  </BlockStack>
                </Card>
              </Grid.Cell>
            ))}
          </Grid>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <Box
              padding="400"
              background="bg-surface"
              borderRadius="200"
              borderWidth="025"
              borderColor="border"
            >
              <BlockStack gap="300">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Tell us more about your experience
                </Text>
                
                <textarea
                  placeholder="What did you like? What could be improved? Any suggestions?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    border: '1px solid #c9cccf',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
                
                <InlineStack gap="200" align="end">
                  <Button
                    variant="plain"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackText.trim()}
                  >
                    Submit Feedback
                  </Button>
                </InlineStack>
              </BlockStack>
            </Box>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
