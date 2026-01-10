import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError, isRouteErrorResponse } from "react-router";
import { useEffect, useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import { NotFoundPage } from "../components/NotFoundPage";

import enTranslations from "@shopify/polaris/locales/en.json";
import frTranslations from "@shopify/polaris/locales/fr.json";
import deTranslations from "@shopify/polaris/locales/de.json";
import esTranslations from "@shopify/polaris/locales/es.json";

import { authenticate } from "../shopify.server";
import {
  loadUserPreferencesClient,
  LANGUAGE_EVENT,
} from "../utils/userPreferences.client";

const I18N_MAP = {
  en: enTranslations,
  fr: frTranslations,
  de: deTranslations,
  es: esTranslations,
} as const;

function getPolarisI18n(language: string) {
  return I18N_MAP[language as keyof typeof I18N_MAP] ?? enTranslations;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const locale = (session as any).locale?.toString().split(/[-_]/)[0] || "en";

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "", locale };
};

export default function App() {
  const { apiKey, locale } = useLoaderData<typeof loader>();

  const [language, setLanguage] = useState<string>(locale);
  const [polarisI18n, setPolarisI18n] = useState(() => getPolarisI18n(locale));

  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false; // Prevent multiple loads

    // Load initial user preference (or default to Shopify locale) - only once
    if (!hasLoaded) {
      hasLoaded = true;
      loadUserPreferencesClient(locale)
        .then((prefs) => {
          if (!isMounted) return;
          const lang = prefs.language || locale;
          setLanguage(lang);
          setPolarisI18n(getPolarisI18n(lang));
        })
        .catch((error) => {
          // Silently fail - already handled in loadUserPreferencesClient
          if (!isMounted) return;
          setPolarisI18n(getPolarisI18n(locale));
        });
    }

    // React to language changes from Settings (cookie + DB update)
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ language?: string }>).detail;
      const lang = detail?.language;
      if (!lang) return;
      setLanguage(lang);
      setPolarisI18n(getPolarisI18n(lang));
    };

    if (typeof window !== "undefined") {
      window.addEventListener(LANGUAGE_EVENT, handler as EventListener);
    }

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener(LANGUAGE_EVENT, handler as EventListener);
      }
    };
  }, [locale]); // Only run when locale changes, not on every render

  return (
    <ShopifyAppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={polarisI18n}>
        <s-app-nav>
          <s-link href="/app">Home</s-link>
          <s-link href="/app/dashboard">Dashboard</s-link>
          <s-link href="/app/ai-search-analyzer">AI Search & Analyzer</s-link>
          <s-link href="/app/filter-audience">Filter Audience</s-link>
          <s-link href="/app/my-saved-lists">My Saved Lists</s-link>
          <s-link href="/app/subscription">Subscription</s-link>
          <s-link href="/app/settings">Settings</s-link>
          <s-link href="/app/help-support">Help & Support</s-link>
        </s-app-nav>
        <Outlet />
      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  const error = useRouteError();
  
  // Handle 404 errors gracefully - show NotFoundPage instead of error
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }
  
  // For other errors, use Shopify's boundary handler
  return boundary.error(error);
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
