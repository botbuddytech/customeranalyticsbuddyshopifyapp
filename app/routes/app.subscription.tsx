import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page, Frame } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getSupabaseForShop } from "../services/supabase-jwt.server";
import { SubscriptionPageContent } from "../components/subscription";

type PlanWithBenefits = {
  id: string;
  code: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  badgeTone: string | null;
  badgeLabel: string | null;
  primaryCtaLabel: string;
  primaryCtaVariant: string;
  isCurrentDefault: boolean;
  benefits: {
    id: string;
    planId: string;
    sortOrder: number;
    label: string;
  }[];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;

  // Use Supabase with JWT for RLS support
  const supabase = getSupabaseForShop(shop);

  // Fetch plans with benefits (RLS will filter if policies are added)
  // Note: Column names match Prisma schema (camelCase since no @map on fields)
  const { data: plansData, error: plansError } = await supabase
    .from("subscription_plans")
    .select(
      `
      *,
      subscription_plan_benefits (
        id,
        planId,
        sortOrder,
        label
      )
    `,
    )
    .order("isCurrentDefault", { ascending: false });

  if (plansError) {
    console.error("Error fetching subscription plans:", plansError);
    return { plans: [], currentPlan: null };
  }

  // Map Supabase data to expected structure
  // Supabase returns data matching Prisma schema (camelCase columns)
  const plans: PlanWithBenefits[] =
    plansData?.map((plan: any) => ({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      price: plan.price,
      priceNote: plan.priceNote,
      description: plan.description,
      badgeTone: plan.badgeTone,
      badgeLabel: plan.badgeLabel,
      primaryCtaLabel: plan.primaryCtaLabel,
      primaryCtaVariant: plan.primaryCtaVariant,
      isCurrentDefault: plan.isCurrentDefault,
      benefits: (plan.subscription_plan_benefits || []).sort(
        (a: any, b: any) => a.sortOrder - b.sortOrder,
      ),
    })) || [];

  // Fetch current Shopify subscription
  let currentPlan: string | null = null;
  try {
    const response = await admin.graphql(`
      query AppCurrentSubscription {
        appInstallation {
          activeSubscriptions {
            name
            status
          }
        }
      }
    `);

    const json = await response.json();
    const activeSub =
      json.data?.appInstallation?.activeSubscriptions?.[0] || null;

    if (activeSub?.name) {
      currentPlan = activeSub.name as string;
    }
  } catch (error) {
    console.error(
      "[Subscription loader] Error fetching current subscription:",
      error,
    );
  }

  return { plans, currentPlan };
};

export default function SubscriptionPage() {
  const { plans, currentPlan } = useLoaderData<typeof loader>() as {
    plans: PlanWithBenefits[];
    currentPlan: string | null;
  };

  return (
    <Frame>
      <Page>
        <TitleBar title="Subscription" />
        <SubscriptionPageContent plans={plans} currentPlan={currentPlan} />
      </Page>
    </Frame>
  );
}
