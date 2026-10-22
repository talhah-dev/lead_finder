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
import { US_STATES_DATA } from "@/data/mockLeads";

export interface RegionOption {
  code: string;
  label: string;
  region?: string;
}

interface StateComboboxProps {
  value?: string;
  onValueChange: (state: string) => void;
  className?: string;
  placeholder?: string;
  items?: RegionOption[];
}

export function StateCombobox({
  value,
  onValueChange,
  className,
  placeholder = "Search state...",
  items,
}: StateComboboxProps) {
  const list = useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }
    return US_STATES_DATA;
  }, [items]);

  const selectedState = useMemo(() => {
    if (
      !value ||
      value.startsWith("All ") ||
      value === "All States" ||
      value === "All Regions" ||
      value === "All Cities"
    ) {
      return list[0] ?? null;
    }
    const match = list.find(
      (s) =>
        s.label.toLowerCase() === value.toLowerCase() ||
        s.code.toLowerCase() === value.toLowerCase()
    );
    return match ?? { code: "CUSTOM", label: value, region: "Custom" };
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
      value={selectedState}
      onValueChange={(val: RegionOption | null) => {
        if (val) {
          onValueChange(val.label);
        }
      }}
      itemToStringValue={(state: RegionOption) => state?.label ?? ""}
      itemToStringLabel={(state: RegionOption) => state?.label ?? ""}
      isItemEqualToValue={(a: RegionOption, b: RegionOption) =>
        a?.code === b?.code || a?.label === b?.label
      }
    >
      <ComboboxInput
        placeholder={placeholder}
        className={className || "w-full h-10"}
        onFocus={handleSelectAll}
        onClick={handleSelectAll}
      />
      <ComboboxContent className="min-w-64 max-h-80">
        <ComboboxEmpty>No locations found.</ComboboxEmpty>
        <ComboboxList>
          {(state: RegionOption) => (
            <ComboboxItem
              key={`${state.region || ""}-${state.code}-${state.label}`}
              value={state}
            >
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {state.label}
                  </ItemTitle>
                  {state.region && (
                    <ItemDescription>
                      {state.region} {state.code ? `(${state.code})` : ""}
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

export const ComboboxWithCustomItems = StateCombobox;
