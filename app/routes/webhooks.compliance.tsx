import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Compliance Webhooks Handler
 * 
 * Handles all three mandatory compliance webhooks:
 * - customers/data_request: Requests to view stored customer data
 * - customers/redact: Requests to delete customer data
 * - shop/redact: Requests to delete shop data
 * 
 * Requirements:
 * - Respond with 200 status code to confirm receipt
 * - Complete actions within 30 days
 * - Verify HMAC (handled by authenticate.webhook)
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // authenticate.webhook automatically verifies HMAC and returns 401 if invalid
    const { payload, shop, topic } = await authenticate.webhook(request);

    console.log(`[Compliance] Received ${topic} webhook for ${shop}`);

    // Route to appropriate handler based on topic
    switch (topic) {
      case "customers/data_request":
        return await handleDataRequest(payload, shop);
      
      case "customers/redact":
        return await handleCustomerRedact(payload, shop);
      
      case "shop/redact":
        return await handleShopRedact(payload, shop);
      
      default:
        console.warn(`[Compliance] Unknown topic: ${topic}`);
        return new Response(null, { status: 200 });
    }
  } catch (error) {
    console.error("[Compliance] Error processing webhook:", error);
    // Still return 200 to acknowledge receipt
    return new Response(null, { status: 200 });
  }
};

/**
 * Handle customers/data_request webhook
 * 
 * When a customer requests their data, provide it to the store owner.
 */
async function handleDataRequest(payload: unknown, shop: string) {
  const {
    shop_id,
    shop_domain,
    orders_requested,
    customer,
    data_request,
  } = payload as {
    shop_id: number;
    shop_domain: string;
    orders_requested: number[];
    customer: {
      id: number;
      email?: string;
      phone?: string;
    };
    data_request: {
      id: number;
    };
  };

  console.log(`[Compliance] Data request ID: ${data_request.id} for customer ${customer.id || customer.email}`);

  const customerId = customer.id?.toString() || customer.email;

  if (customerId) {
    // Find saved customer lists that contain this customer
    const savedLists = await db.savedCustomerList.findMany({
      where: {
        shop: shop_domain,
        customerIds: {
          has: customerId,
        },
      },
    });

    // Find chat sessions for this shop (if they contain customer data)
    const chatSessions = await db.chatSession.findMany({
      where: {
        shopId: shop_domain,
      },
      include: {
        messages: true,
      },
    });

    console.log(`[Compliance] Found ${savedLists.length} saved lists and ${chatSessions.length} chat sessions`);

    // TODO: In production, compile and send this data to the store owner:
    // 1. Create a data export file (JSON/CSV)
    // 2. Include: saved lists, chat history, preferences, analytics
    // 3. Send via email or provide via secure portal
    // 4. Store request ID to track completion
    // 5. Complete within 30 days as required
  }

  return new Response(null, { status: 200 });
}

/**
 * Handle customers/redact webhook
 * 
 * When a store owner requests customer data deletion, delete or anonymize the data.
 */
async function handleCustomerRedact(payload: unknown, shop: string) {
  const {
    shop_id,
    shop_domain,
    orders_to_redact,
    customer,
  } = payload as {
    shop_id: number;
    shop_domain: string;
    orders_to_redact: number[];
    customer: {
      id: number;
      email?: string;
      phone?: string;
    };
  };

  console.log(`[Compliance] Redaction request for customer ${customer.id || customer.email}`);

  const customerId = customer.id?.toString() || customer.email;

  if (customerId) {
    // Remove customer from saved customer lists
    const savedLists = await db.savedCustomerList.findMany({
      where: {
        shop: shop_domain,
        customerIds: {
          has: customerId,
        },
      },
    });

    for (const list of savedLists) {
      const updatedCustomerIds = list.customerIds.filter(
        (id) => id !== customerId
      );

      await db.savedCustomerList.update({
        where: { id: list.id },
        data: {
          customerIds: updatedCustomerIds,
        },
      });
    }

    // Delete chat sessions if they can be identified by customer
    // Note: Adjust based on your actual data structure
    if (customer.email) {
      // If chat sessions store customer email, delete them
      // This is a placeholder - adjust based on your schema
      await db.chatSession.deleteMany({
        where: {
          shopId: shop_domain,
          // Add customer identification logic if your schema supports it
        },
      });
    }

    console.log(`[Compliance] Redacted customer data: ${savedLists.length} lists updated`);

    // TODO: In production, also:
    // 1. Anonymize or delete analytics data
    // 2. Delete from third-party services (email providers, etc.)
    // 3. Log redaction for audit purposes
    // 4. If legally required to retain, mark as anonymized instead
  }

  return new Response(null, { status: 200 });
}

/**
 * Handle shop/redact webhook
 * 
 * 48 hours after uninstall, delete all shop data.
 */
async function handleShopRedact(payload: unknown, shop: string) {
  const { shop_id, shop_domain } = payload as {
    shop_id: number;
    shop_domain: string;
  };

  console.log(`[Compliance] Shop redaction request for ${shop_domain} (ID: ${shop_id})`);

  // Delete all shop-related data
  const deletedLists = await db.savedCustomerList.deleteMany({
    where: { shop: shop_domain },
  });

  await db.dashboardPreferences.deleteMany({
    where: { shop: shop_domain },
  });

  await db.userPreferences.deleteMany({
    where: { shop: shop_domain },
  });

  await db.onboardingProgress.deleteMany({
    where: { shop: shop_domain },
  });

  await db.config.deleteMany({
    where: { shop: shop_domain },
  });

  await db.usageTracking.deleteMany({
    where: { shop: shop_domain },
  });

  await db.chatSession.deleteMany({
    where: { shopId: shop_domain },
  });

  await db.mailchimpConnection.deleteMany({
    where: { shopId: shop_domain },
  });

  console.log(`[Compliance] Deleted shop data: ${deletedLists.count} lists and all related data`);

  // TODO: In production, also:
  // 1. Delete from third-party services
  // 2. Delete files/assets
  // 3. Cancel scheduled jobs
  // 4. Log deletion for audit

  return new Response(null, { status: 200 });
}

