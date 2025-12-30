import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page, Frame } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { AISearchAnalyzerPage } from "../components/ai-search-analyzer";
import { getShopInfo } from "../services/shop-info.server";

interface LoaderData {
  apiKey: string;
  shopInfo: {
    name: string;
    email: string;
    shop: string;
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shopInfo = await getShopInfo(admin, session.shop);
  
  return {
    apiKey: process.env.OPENAI_API_KEY || "demo-mode",
    shopInfo,
  };
};

export default function AISearchAnalyzerRoute() {
  const { apiKey, shopInfo } = useLoaderData<LoaderData>();

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar title="AI Search & Analyzer" />
        <AISearchAnalyzerPage apiKey={apiKey} shopInfo={shopInfo} />
      </Page>
    </Frame>
  );
}
