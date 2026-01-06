import { InlineGrid } from "@shopify/polaris";
import { VideosTutorials } from "../videos-tutorials";
import { AppDocumentation } from "../app-documentation";
import { GettingStarted } from "../getting-started";

/**
 * Resources Component
 *
 * Displays Videos & Tutorials, App Documentation, and Getting Started cards in a single row
 */
export function Resources() {
  return (
    <InlineGrid
      columns={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}
      gap={{ xs: "400", sm: "400", md: "400", lg: "400", xl: "400" }}
    >
      <AppDocumentation />
      <GettingStarted />
      <VideosTutorials />
    </InlineGrid>
  );
}
