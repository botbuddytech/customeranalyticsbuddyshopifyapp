/**
 * Products Seeder
 *
 * Seeds products to Shopify store using Admin GraphQL API
 */

import { shopifyGraphQL, delay, log } from "../utils/shopify-client.js";
import productsData from "../data/products.json" assert { type: "json" };

interface ProductVariantInput {
  price: string;
  sku: string;
  inventoryQuantity: number;
  options: string[];
}

interface ProductInput {
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  variants: ProductVariantInput[];
  options: string[];
}

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
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

export async function seedProducts(): Promise<void> {
  log("📦", "Starting products seeding...");

  const products = productsData.products as ProductInput[];
  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      const input = {
        title: product.title,
        descriptionHtml: product.descriptionHtml,
        vendor: product.vendor,
        productType: product.productType,
        tags: product.tags,
        options: product.options,
        variants: product.variants.map((v) => ({
          price: v.price,
          sku: v.sku,
          options: v.options,
        })),
      };

      const result = await shopifyGraphQL<{
        productCreate: {
          product: { id: string; title: string; handle: string } | null;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      }>(CREATE_PRODUCT_MUTATION, { input });

      if (result.productCreate.userErrors.length > 0) {
        log("⚠️", `Product "${product.title}" had errors:`);
        result.productCreate.userErrors.forEach((e) =>
          console.log(`   - ${e.field.join(".")}: ${e.message}`)
        );
        errorCount++;
      } else if (result.productCreate.product) {
        log("✅", `Created product: ${result.productCreate.product.title}`);
        successCount++;
      }

      // Respect rate limits
      await delay(500);
    } catch (error) {
      log("❌", `Failed to create product "${product.title}": ${error}`);
      errorCount++;
    }
  }

  log("📦", `Products seeding complete: ${successCount} created, ${errorCount} errors`);
}

