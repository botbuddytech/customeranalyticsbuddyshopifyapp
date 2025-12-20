#!/usr/bin/env node
/**
 * Main Seed Script
 *
 * Usage:
 *   npm run seed              # Seed all data
 *   npm run seed:products     # Seed only products
 *   npm run seed:collections  # Seed only collections
 *   npm run seed:customers    # Seed only customers
 *
 * Environment variables required:
 *   SHOPIFY_SEED_STORE        - Your store domain (e.g., your-store.myshopify.com)
 *   SHOPIFY_SEED_ACCESS_TOKEN - Admin API access token
 */

import { seedProducts, seedCollections, seedCustomers } from "./seeders/index.js";
import { log, SHOPIFY_STORE_DOMAIN } from "./utils/shopify-client.js";

type SeederName = "products" | "collections" | "customers" | "all";

const SEEDERS: Record<Exclude<SeederName, "all">, () => Promise<void>> = {
  products: seedProducts,
  collections: seedCollections,
  customers: seedCustomers,
};

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const onlyArg = args.find((arg) => arg.startsWith("--only="));
  const seederName = onlyArg ? (onlyArg.split("=")[1] as SeederName) : "all";

  console.log("\n");
  log("🚀", "=".repeat(50));
  log("🚀", "Shopify Seed Script");
  log("🚀", `Store: ${SHOPIFY_STORE_DOMAIN}`);
  log("🚀", `Seeding: ${seederName}`);
  log("🚀", "=".repeat(50));
  console.log("\n");

  const startTime = Date.now();

  try {
    if (seederName === "all") {
      // Run all seeders in order
      await seedProducts();
      console.log("");
      await seedCollections();
      console.log("");
      await seedCustomers();
    } else if (SEEDERS[seederName]) {
      await SEEDERS[seederName]();
    } else {
      log("❌", `Unknown seeder: ${seederName}`);
      log("📋", `Available seeders: ${Object.keys(SEEDERS).join(", ")}, all`);
      process.exit(1);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log("\n");
    log("✨", "=".repeat(50));
    log("✨", `Seeding completed in ${duration}s`);
    log("✨", "=".repeat(50));
    console.log("\n");
  } catch (error) {
    log("💥", `Seeding failed: ${error}`);
    process.exit(1);
  }
}

main();

