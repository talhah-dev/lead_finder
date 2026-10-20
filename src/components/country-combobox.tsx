"use client";

import { useMemo } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { WorldCountry } from "@/types/admin";

export interface CountryOption extends WorldCountry {
  id?: string;
  label?: string;
}

const DEFAULT_POPULAR_COUNTRIES: CountryOption[] = [
  { name: "United States", code: "US", flag: "🇺🇸", phonecode: "1", statesCount: 51 },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", phonecode: "44", statesCount: 4 },
  { name: "Canada", code: "CA", flag: "🇨🇦", phonecode: "1", statesCount: 13 },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", phonecode: "92", statesCount: 8 },
  { name: "Australia", code: "AU", flag: "🇦🇺", phonecode: "61", statesCount: 8 },
  { name: "Germany", code: "DE", flag: "🇩🇪", phonecode: "49", statesCount: 16 },
  { name: "France", code: "FR", flag: "🇫🇷", phonecode: "33", statesCount: 18 },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", phonecode: "971", statesCount: 7 },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", phonecode: "966", statesCount: 13 },
  { name: "India", code: "IN", flag: "🇮🇳", phonecode: "91", statesCount: 36 },
];

interface CountryComboboxProps {
  value?: string;
  onValueChange: (country: CountryOption) => void;
  className?: string;
  placeholder?: string;
  items?: CountryOption[];
}

export function CountryCombobox({
  value,
  onValueChange,
  className,
  placeholder = "Search country...",
  items,
}: CountryComboboxProps) {
  const list = useMemo(() => {
    if (items && items.length > 0) return items;
    return DEFAULT_POPULAR_COUNTRIES;
  }, [items]);

  const selectedCountry = useMemo(() => {
    if (!value) {
      return (list.find((c) => c.code === "US") || list[0]) ?? null;
    }
    const match = list.find(
      (c) =>
        c.name.toLowerCase() === value.toLowerCase() ||
        c.code.toLowerCase() === value.toLowerCase()
    );
    return match ?? { name: value, code: "CUSTOM", flag: "🌐" };
  }, [value, list]);

  const handleSelectAll = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    target.select();
    requestAnimationFrame(() => {
      target.select();
    });
  };

  return (
    <Combobox
      items={list}
      value={selectedCountry}
      onValueChange={(val: CountryOption | null) => {
        if (val) {
          onValueChange(val);
        }
      }}
      itemToStringValue={(c: CountryOption) => c?.name ?? ""}
      itemToStringLabel={(c: CountryOption) => c?.name ?? ""}
      isItemEqualToValue={(a: CountryOption, b: CountryOption) =>
        a?.code === b?.code || a?.name?.toLowerCase() === b?.name?.toLowerCase()
      }
    >
      <ComboboxInput
        placeholder={placeholder}
        className={className || "w-full h-10"}
        onFocus={handleSelectAll}
        onClick={handleSelectAll}
      />
      <ComboboxContent className="min-w-64 max-h-80">
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {(country: CountryOption) => (
            <ComboboxItem key={country.code} value={country}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {country.name}
                  </ItemTitle>
                  {country.statesCount !== undefined && country.statesCount > 0 ? (
                    <ItemDescription>
                      {country.statesCount} regions
                    </ItemDescription>
                  ) : (
                    <ItemDescription>
                      Regions
                    </ItemDescription>
                  )}
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
