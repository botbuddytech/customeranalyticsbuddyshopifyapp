/**
 * Customers Seeder
 *
 * Seeds customers to Shopify store using Admin GraphQL API
 */

import { shopifyGraphQL, delay, log } from "../utils/shopify-client.js";
import customersData from "../data/customers.json" assert { type: "json" };

interface AddressInput {
  address1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
}

interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  addresses: AddressInput[];
  tags?: string[];
  note?: string;
}

const CREATE_CUSTOMER_MUTATION = `
  mutation CreateCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function seedCustomers(): Promise<void> {
  log("👥", "Starting customers seeding...");

  const customers = customersData.customers as CustomerInput[];
  let successCount = 0;
  let errorCount = 0;

  for (const customer of customers) {
    try {
      const input: Record<string, unknown> = {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        tags: customer.tags || [],
      };

      if (customer.phone) {
        input.phone = customer.phone;
      }

      if (customer.note) {
        input.note = customer.note;
      }

      if (customer.addresses && customer.addresses.length > 0) {
        input.addresses = customer.addresses.map((addr) => ({
          address1: addr.address1,
          city: addr.city,
          provinceCode: addr.province,
          countryCode: addr.country,
          zip: addr.zip,
        }));
      }

      const result = await shopifyGraphQL<{
        customerCreate: {
          customer: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
          } | null;
          userErrors: Array<{ field: string[]; message: string }>;
        };
      }>(CREATE_CUSTOMER_MUTATION, { input });

      if (result.customerCreate.userErrors.length > 0) {
        log("⚠️", `Customer "${customer.email}" had errors:`);
        result.customerCreate.userErrors.forEach((e) =>
          console.log(`   - ${e.field.join(".")}: ${e.message}`)
        );
        errorCount++;
      } else if (result.customerCreate.customer) {
        const c = result.customerCreate.customer;
        log("✅", `Created customer: ${c.firstName} ${c.lastName} (${c.email})`);
        successCount++;
      }

      await delay(500);
    } catch (error) {
      log("❌", `Failed to create customer "${customer.email}": ${error}`);
      errorCount++;
    }
  }

  log("👥", `Customers seeding complete: ${successCount} created, ${errorCount} errors`);
}

