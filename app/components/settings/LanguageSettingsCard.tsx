import { Card, BlockStack, Text, Select } from "@shopify/polaris";

// Available languages configuration (can be reused by other parts of the app)
export const LANGUAGE_CONFIG: Record<
  string,
  {
    label: string;
    locale: string;
  }
> = {
  en: { label: "English", locale: "en" },
  fr: { label: "Français", locale: "fr" },
  de: { label: "Deutsch", locale: "de" },
  es: { label: "Español", locale: "es" },
};

interface LanguageSettingsCardProps {
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
}

export function LanguageSettingsCard({
  selectedLanguage,
  onLanguageChange,
}: LanguageSettingsCardProps) {
  const options = Object.entries(LANGUAGE_CONFIG).map(([code, config]) => ({
    label: config.label,
    value: code,
  }));

  return (
    <Card>
      <BlockStack gap="200">
        <Select
          label="Language"
          options={options}
          value={selectedLanguage}
          onChange={onLanguageChange}
          helpText="Choose which language you prefer to see in the app. This can later control external translation services like Weglot."
        />

        <Text as="p" variant="bodySm" tone="subdued">
          Available languages (for developers):{" "}
          {options.map((opt) => opt.value).join(", ")}
        </Text>
      </BlockStack>
    </Card>
  );
}


