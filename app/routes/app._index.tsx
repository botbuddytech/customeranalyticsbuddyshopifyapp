/**
 * Welcome Screen for AI Audience Insight Shopify App
 *
 * This page serves as the first-time onboarding experience for merchants.
 * It includes video tutorials, progress tracking, and quick action buttons
 * to help users get started with customer segmentation and campaigns.
 */

// React hooks for managing component state
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router";

// Polaris UI Components
// Polaris is Shopify's design system - provides consistent styling and behavior
import {
  Page,        // Main page wrapper with proper spacing and layout
  Layout,      // Responsive grid system for organizing content
  Text,        // Typography component with predefined styles
  Card,        // Container with shadow and padding for content sections
  Button,      // Interactive buttons with Shopify styling
  BlockStack,  // Vertical layout component (replaces old Stack)
  InlineStack, // Horizontal layout component
  Badge,       // Small status indicators (like progress counters)
  Icon,        // Displays SVG icons from Polaris icon library
  Divider,     // Visual separator between content sections
  Grid,        // Responsive grid for card layouts
  Box,         // Generic container with customizable styling
} from "@shopify/polaris";

// Polaris Icons
// Pre-built SVG icons that match Shopify's design system
import {
  CheckIcon,      // Checkmark for completed tasks
  PlayIcon,       // Play button for video content
  PersonIcon,     // User/customer related actions
  FilterIcon,     // Filtering and search functionality
  ViewIcon,       // Viewing and display actions
  SettingsIcon,   // Configuration and settings
  CollectionIcon, // Lists and collections of items
} from "@shopify/polaris-icons";

// App Bridge Components
// App Bridge connects your app to the Shopify Admin interface
import { TitleBar } from "@shopify/app-bridge-react";

// Authentication utilities
// Handles Shopify OAuth and session management
import { authenticate } from "../shopify.server";

/**
 * Loader Function - Server-side Authentication
 *
 * This function runs on the server before the page loads.
 * It ensures the user is properly authenticated with Shopify.
 *
 * Why: Shopify apps must verify the merchant's session before showing any content
 * How: Uses Shopify's authenticate.admin() to check session tokens
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Verify the merchant is logged in and has valid permissions
  // This will redirect to Shopify's OAuth flow if authentication fails
  await authenticate.admin(request);

  // Return null since we don't need to pass any data to the component
  // In a real app, you might return shop data, user preferences, etc.
  return null;
};

/**
 * Main Welcome Screen Component
 *
 * This is the default export that renders the welcome page.
 * It manages onboarding progress and displays interactive tutorials.
 */
export default function Index() {
  // ==========================================
  // State Management
  // ==========================================

  // Track which onboarding steps the user has completed
  // Why: Helps users see their progress and know what to do next
  // How: Array of step IDs (numbers) that have been marked complete
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Feedback and rating state
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');

  // ==========================================
  // Feedback and Rating Configuration
  // ==========================================

  // Feedback categories for different types of feedback
  const feedbackCategories: Array<{
    type: string;
    title: string;
    icon: string;
    buttonText: string;
  }> = [
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

  // ==========================================
  // Event Handlers
  // ==========================================

  // Handle star rating selection
  const handleStarRating = (rating: number) => {
    setCurrentRating(rating);
  };

  // Handle feedback category selection
  const handleFeedbackCategory = (type: string) => {
    setShowFeedbackForm(true);
    // You can add logic here to pre-fill the form based on category
  };

  // Handle feedback submission
  const handleSubmitFeedback = () => {
    // Here you would typically send the feedback to your backend
    // For now, we'll just show an alert and reset the form
    alert(`Thank you for your ${currentRating > 0 ? `${currentRating}-star ` : ''}feedback! We'll review it and get back to you.`);
    setFeedbackText('');
    setShowFeedbackForm(false);
    setCurrentRating(0);
  };

  // ==========================================
  // Onboarding Steps Configuration
  // ==========================================

  // Define the 3-step onboarding checklist
  // Why: Guides new users through the most important features first
  // How: Each step has an ID for tracking, title/description for display, and icon for visual appeal
  const quickStartSteps = [
    {
      id: 1,
      title: "Use AI to generate your first customer segment",
      description: "Let AI analyze your customers and create smart segments",
      icon: PersonIcon, // Person icon represents customer-focused features
    },
    {
      id: 2,
      title: "Filter customers manually using 20+ audience traits",
      description: "Create precise segments with advanced filtering options",
      icon: FilterIcon, // Filter icon represents manual segmentation
    },
    {
      id: 3,
      title: "Send your first WhatsApp or Email campaign",
      description: "Engage your segments with targeted messaging",
      icon: ViewIcon, // View icon represents outreach and communication
    },
  ];

  // ==========================================
  // Quick Action Links Configuration
  // ==========================================

  // Define the main action buttons that appear in a grid
  // Why: Provides immediate access to core app features
  // How: Each link has a URL, visual styling (variant), and descriptive text
  const quickLinks = [
    {
      title: "Start with AI Search",
      description: "Generate segments using AI",
      url: "/app/dashboard",           // Route to main dashboard
      icon: PersonIcon,                // Person icon for AI customer analysis
      variant: "primary" as const,     // Primary styling (blue button)
    },
    {
      title: "Filter Customers Manually",
      description: "Use advanced filters",
      url: "/app/filter-audience",     // Route to manual filtering page
      icon: FilterIcon,                // Filter icon for manual segmentation
      variant: "secondary" as const,   // Secondary styling (gray button)
    },
    {
      title: "View Saved Lists",
      description: "Manage your segments",
      url: "/app/saved-lists",         // Route to saved segments page
      icon: CollectionIcon,            // Collection icon for lists/groups
      variant: "secondary" as const,   // Secondary styling
    },
    {
      title: "Open Settings",
      description: "Configure your app",
      url: "/app/settings",            // Route to app configuration
      icon: SettingsIcon,              // Settings icon for configuration
      variant: "secondary" as const,   // Secondary styling
    },
  ];

  // ==========================================
  // Event Handlers
  // ==========================================

  // Handle clicking "Mark Complete" or "Undo" on onboarding steps
  // Why: Allows users to track their progress through the onboarding
  // How: Adds/removes step IDs from the completedSteps array
  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)  // Remove if already completed
        : [...prev, stepId]                 // Add if not completed
    );
  };

  // ==========================================
  // Main Component Render
  // ==========================================

  return (
    // Page: Main wrapper component from Polaris
    // Provides consistent spacing and layout for Shopify apps
    <Page>
      {/* TitleBar: Shows in the Shopify Admin navigation */}
      {/* This appears at the top of the admin interface */}
      <TitleBar title="AI Audience Insight" />

      {/* BlockStack: Vertical layout with consistent spacing */}
      {/* gap="500" provides medium spacing between sections */}
      <BlockStack gap="500">
        {/* Layout: Responsive grid system from Polaris */}
        {/* Automatically adjusts for mobile, tablet, and desktop */}
        <Layout>

          {/* ==========================================
               Welcome Header Section
               ========================================== */}

          {/* Layout.Section: Individual section within the grid */}
          <Layout.Section>
            {/* Card: Container with shadow and padding */}
            {/* Provides visual separation and consistent spacing */}
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  {/* Main heading using Polaris typography */}
                  {/* as="h1" creates semantic HTML, variant="headingLg" applies Polaris styling */}
                  <Text as="h1" variant="headingLg">
                    Welcome to Customer Analytics Buddy
                  </Text>

                  {/* Subtitle with subdued tone for visual hierarchy */}
                  {/* tone="subdued" makes text lighter gray */}
                  <Text as="h2" variant="headingMd" tone="subdued">
                    Your smart assistant for understanding customers and sending powerful campaigns.
                  </Text>

                  {/* Body text explaining the app's core value proposition */}
                  <Text variant="bodyMd" as="p">
                    Use AI or manual filters to create high-converting segments and send WhatsApp or email messages — all in one place.
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* ==========================================
               Video Tutorial Section
               ========================================== */}

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  {/* Header with play icon and title */}
                  {/* InlineStack: Horizontal layout for icon + text */}
                  <InlineStack gap="200" align="center">
                    {/* Play icon to indicate video content */}
                    <Icon source={PlayIcon} tone="emphasis" />
                    <Text as="h3" variant="headingMd">
                      Watch: Complete Setup & First Campaign Tutorial
                    </Text>
                  </InlineStack>

                  {/* Detailed description of what the video covers */}
                  {/* Helps users understand the value before clicking play */}
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Learn how to set up your first AI-powered customer segment and send targeted campaigns in under 10 minutes. This step-by-step guide covers everything from connecting your store to launching your first WhatsApp or email campaign.
                  </Text>
                </BlockStack>

                {/* Video container with responsive styling */}
                {/* Box: Generic container with customizable background and borders */}
                <Box
                  padding="400"                      // Medium padding around video
                  background="bg-surface-secondary"  // Light gray background
                  borderRadius="200"                 // Rounded corners
                  borderWidth="025"                  // Thin border
                  borderColor="border"               // Default border color
                >
                  {/* Responsive video wrapper */}
                  {/* This CSS creates a 16:9 aspect ratio that scales with screen size */}
                  <div style={{
                    position: 'relative',
                    paddingBottom: '56.25%',  // 16:9 aspect ratio (9/16 = 0.5625)
                    height: 0,                // Height controlled by padding
                    overflow: 'hidden',       // Hide any overflow
                    borderRadius: '8px'       // Rounded corners for video
                  }}>
                    {/* YouTube embed iframe */}
                    {/* src: YouTube embed URL with video ID */}
                    <iframe
                      src="https://www.youtube.com/embed/xNUx-rMGvvw"
                      title="Complete Setup & First Campaign Tutorial"
                      style={{
                        position: 'absolute',  // Position over the wrapper div
                        top: 0,
                        left: 0,
                        width: '100%',         // Fill the container
                        height: '100%',        // Fill the container
                        border: 'none'         // Remove default iframe border
                      }}
                      allowFullScreen        // Allow fullscreen video playback
                    />
                  </div>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* ==========================================
               Quick Start Checklist Section
               ========================================== */}

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  {/* Header with title and progress badge */}
                  {/* align="space-between" puts title on left, badge on right */}
                  <InlineStack gap="200" align="space-between">
                    <Text as="h3" variant="headingMd">
                      Quick Start Guide
                    </Text>

                    {/* Progress badge showing completion status */}
                    {/* tone="info" gives it a blue color */}
                    <Badge tone="info">
                      {`${completedSteps.length}/${quickStartSteps.length} Completed`}
                    </Badge>
                  </InlineStack>

                  {/* Description of the checklist purpose */}
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Follow these steps to get the most out of your app
                  </Text>
                </BlockStack>

                {/* List of interactive checklist items */}
                <BlockStack gap="300">
                  {/* Map through each step to create interactive cards */}
                  {quickStartSteps.map((step) => (
                    <Box
                      key={step.id}
                      padding="400"
                      // Conditional styling: green background if completed, white if not
                      background={completedSteps.includes(step.id) ? "bg-surface-success" : "bg-surface"}
                      borderRadius="200"
                      borderWidth="025"
                      // Conditional border: green border if completed, gray if not
                      borderColor={completedSteps.includes(step.id) ? "border-success" : "border"}
                    >
                      {/* Horizontal layout: content on left, button on right */}
                      <InlineStack gap="300" align="space-between">

                        {/* Left side: icon and text content */}
                        <InlineStack gap="300" align="start">
                          {/* Dynamic icon: checkmark if completed, step icon if not */}
                          <Icon
                            source={completedSteps.includes(step.id) ? CheckIcon : step.icon}
                            tone={completedSteps.includes(step.id) ? "success" : "base"}
                          />

                          {/* Step title and description */}
                          <BlockStack gap="100">
                            <Text as="p" variant="bodyMd" fontWeight="semibold">
                              {step.title}
                            </Text>
                            <Text as="p" variant="bodySm" tone="subdued">
                              {step.description}
                            </Text>
                          </BlockStack>
                        </InlineStack>

                        {/* Right side: toggle button */}
                        {/* variant="plain" makes it look like a text link */}
                        <Button
                          variant="plain"
                          onClick={() => toggleStep(step.id)}
                          // Accessibility: screen readers will announce this label
                          accessibilityLabel={`Mark step ${step.id} as ${completedSteps.includes(step.id) ? 'incomplete' : 'complete'}`}
                        >
                          {/* Dynamic button text based on completion status */}
                          {completedSteps.includes(step.id) ? "Undo" : "Mark Complete"}
                        </Button>
                      </InlineStack>
                    </Box>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* ==========================================
               Feedback & Rating Section
               ========================================== */}

          <Layout.Section>
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

                {/* Rating System */}
                <BlockStack gap="300">
                  {/* Overall Rating */}
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
                      
                                               {/* Star Rating Display */}
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
          </Layout.Section>

          {/* ==========================================
               Progress Metrics Sidebar
               ========================================== */}

          {/* variant="oneThird" makes this section take up 1/3 of the width */}
          {/* This creates a sidebar layout on desktop, stacks on mobile */}
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">

              {/* Progress metrics card */}
              <Card>
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Your Progress
                  </Text>

                  {/* List of key performance indicators */}
                  {/* These would be populated from real data in a production app */}
                  <BlockStack gap="300">

                    {/* Metric: Number of customer segments created */}
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Segments Created
                      </Text>
                      {/* Badge: Small colored indicator for the metric value */}
                      <Badge tone="info">0</Badge>
                    </InlineStack>

                    {/* Divider: Visual separator between metrics */}
                    <Divider />

                    {/* Metric: Total customers reached via campaigns */}
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Customers Messaged
                      </Text>
                      <Badge tone="info">0</Badge>
                    </InlineStack>

                    <Divider />

                    {/* Metric: Campaign performance indicator */}
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Average Open Rate
                      </Text>
                      {/* "--" indicates no data available yet */}
                      <Badge tone="info">--</Badge>
                    </InlineStack>

                    <Divider />

                    {/* Metric: Business impact measurement */}
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Repeat Purchases
                      </Text>
                      <Badge tone="info">0</Badge>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>

              {/* ==========================================
                   Customer Support Card
                   ========================================== */}

              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Need Help?
                  </Text>

                  {/* Support options with different contact methods */}
                  <BlockStack gap="200">

                    {/* Documentation link */}
                    {/* external prop opens in new tab */}
                    <Button variant="plain" url="https://docs.audienceinsight.com" external>
                      📚 View Documentation
                    </Button>

                    {/* Email support link */}
                    {/* mailto: opens user's default email client */}
                    <Button variant="plain" url="mailto:care@audienceinsight.com" external>
                      🎧 Customer Care Team
                    </Button>

                    {/* Live chat integration */}
                    {/* onClick handler for chatbot integration */}
                    <Button
                      variant="plain"
                      onClick={() => {
                        // Chatbot Integration Examples:
                        // Intercom: window.Intercom('show')
                        // Crisp: window.$crisp.push(['do', 'chat:open'])
                        // Zendesk: window.zE('webWidget', 'open')
                        // Freshchat: window.fcWidget.open()
                        alert('Opening live chat... (integrate with your chat service like Intercom, Crisp, or Zendesk)');
                      }}
                    >
                      🤖 Live Chat Support
                    </Button>

                    {/* Community forum link */}
                    <Button variant="plain" url="https://community.audienceinsight.com" external>
                      👥 Join Community
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* ==========================================
               Quick Action Links Section
               ========================================== */}

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Quick Actions
                  </Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Jump straight into the features you need
                  </Text>
                </BlockStack>

                {/* Responsive grid of action cards */}
                {/* Grid automatically adjusts columns based on screen size */}
                <Grid>
                  {/* Map through quickLinks array to create action cards */}
                  {quickLinks.map((link, index) => (
                    <Grid.Cell
                      key={index}
                      // Responsive column spans: 6/12 on mobile, 3/12 on larger screens
                      // This creates 2 columns on mobile, 4 columns on desktop
                      columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}
                    >
                      {/* Individual action card */}
                      <Card>
                        <BlockStack gap="300">

                          {/* Card header with icon and text */}
                          <InlineStack gap="200" align="start">
                            {/* Action icon from the quickLinks configuration */}
                            <Icon source={link.icon} tone="base" />

                            {/* Action title and description */}
                            <BlockStack gap="100">
                              <Text as="p" variant="bodyMd" fontWeight="semibold">
                                {link.title}
                              </Text>
                              <Text as="p" variant="bodySm" tone="subdued">
                                {link.description}
                              </Text>
                            </BlockStack>
                          </InlineStack>

                          {/* Action button */}
                          {/* variant: "primary" (blue) or "secondary" (gray) */}
                          {/* url: Navigation target when clicked */}
                          {/* fullWidth: Button spans the full card width */}
                          <Button
                            variant={link.variant}
                            url={link.url}
                            fullWidth
                          >
                            {link.title}
                          </Button>
                        </BlockStack>
                      </Card>
                    </Grid.Cell>
                  ))}
                </Grid>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
