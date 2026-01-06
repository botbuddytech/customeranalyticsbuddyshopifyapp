/**
 * Collections Seeder
 *
 * Seeds collections to Shopify store using Admin GraphQL API
 */

import { shopifyGraphQL, delay, log } from "../utils/shopify-client.js";
import collectionsData from "../data/collections.json" assert { type: "json" };

interface CollectionRule {
  column: string;
  relation: string;
  condition: string;
}

interface CollectionRuleSet {
  appliedDisjunctively: boolean;
  rules: CollectionRule[];
}

interface CollectionInput {
  title: string;
  descriptionHtml: string;
  ruleSet: CollectionRuleSet | null;
}

// For smart collections (with rules)
const CREATE_SMART_COLLECTION_MUTATION = `
  mutation CreateCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function seedCollections(): Promise<void> {
  log("📁", "Starting collections seeding...");

  const collections = collectionsData.collections as CollectionInput[];
  let successCount = 0;
  let errorCount = 0;

  for (const collection of collections) {
    try {
      const input: Record<string, unknown> = {
        title: collection.title,
        descriptionHtml: collection.descriptionHtml,
      };

      // Add rule set for smart collections
      if (collection.ruleSet) {
        input.ruleSet = collection.ruleSet;
      }

      const result = await shopifyGraphQL<{
        collectionCreate: {
          collection: { id: string; title: string; handle: string } | null;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      }>(CREATE_SMART_COLLECTION_MUTATION, { input });

      if (result.collectionCreate.userErrors.length > 0) {
        log("⚠️", `Collection "${collection.title}" had errors:`);
        result.collectionCreate.userErrors.forEach((e) =>
          console.log(`   - ${e.field.join(".")}: ${e.message}`)
        );
        errorCount++;
      } else if (result.collectionCreate.collection) {
        log("✅", `Created collection: ${result.collectionCreate.collection.title}`);
        successCount++;
      }

      await delay(500);
    } catch (error) {
      log("❌", `Failed to create collection "${collection.title}": ${error}`);
      errorCount++;
    }
  }

  log("📁", `Collections seeding complete: ${successCount} created, ${errorCount} errors`);
}

