import mailchimp from "@mailchimp/mailchimp_marketing";
import prisma from "../db.server";

/**
 * Get Mailchimp configuration for a specific shop
 */
export async function getMailchimpConfig(shopId: string) {
    return await prisma.mailchimpConnection.findUnique({
        where: { shopId },
    });
}

/**
 * Save Mailchimp OAuth token and server prefix for a shop
 */
export async function saveMailchimpToken(
    shopId: string,
    accessToken: string,
    serverPrefix: string,
) {
    return await prisma.mailchimpConnection.upsert({
        where: { shopId },
        create: {
            shopId,
            accessToken,
            serverPrefix,
        },
        update: {
            accessToken,
            serverPrefix,
        },
    });
}

/**
 * Get configured Mailchimp client for a specific shop
 * Returns null if shop hasn't connected Mailchimp
 */
export async function getMailchimpClient(shopId: string) {
    const config = await getMailchimpConfig(shopId);

    if (!config) {
        return null;
    }

    mailchimp.setConfig({
        accessToken: config.accessToken,
        server: config.serverPrefix,
    });

    return mailchimp;
}

/**
 * Disconnect Mailchimp for a shop
 */
export async function disconnectMailchimp(shopId: string) {
    return await prisma.mailchimpConnection.delete({
        where: { shopId },
    });
}
