import { Select } from "@shopify/polaris";

interface StoreSelectorProps {
  selectedStore: string;
  onChange: (value: string) => void;
}

export function StoreSelector({ selectedStore, onChange }: StoreSelectorProps) {
  const options = [
    { label: "ABC Fashion", value: "abc-fashion" },
    { label: "ABC Fashion Outlet", value: "abc-fashion-outlet" },
  ];

  return (
    <Select
      label="Store"
      labelHidden
      options={options}
      value={selectedStore}
      onChange={onChange}
    />
  );
}
