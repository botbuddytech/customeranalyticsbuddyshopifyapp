import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { Page, Frame } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { AISearchAnalyzerPage } from "../components/ai-search-analyzer";

interface LoaderData {
  apiKey: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return {
    apiKey: process.env.OPENAI_API_KEY || "demo-mode",
  };
};

export default function AISearchAnalyzerRoute() {
  const { apiKey } = useLoaderData<LoaderData>();

  return (
    <Frame>
      <Page fullWidth>
        <TitleBar title="AI Search & Analyzer" />
        <AISearchAnalyzerPage apiKey={apiKey} />
      </Page>
    </Frame>
  );
}
