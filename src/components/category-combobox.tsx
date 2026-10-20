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
import { CATEGORIES_DATA, type LeadCategory } from "@/data/mockLeads";

interface CategoryComboboxProps {
  value?: string;
  onValueChange: (category: string) => void;
  className?: string;
  placeholder?: string;
}

export function CategoryCombobox({
  value,
  onValueChange,
  className,
  placeholder = "Search category...",
}: CategoryComboboxProps) {
  const selectedCategory = useMemo(() => {
    return (
      CATEGORIES_DATA.find(
        (c) => c.label.toLowerCase() === (value || "").toLowerCase()
      ) || null
    );
  }, [value]);

  return (
    <Combobox
      items={CATEGORIES_DATA}
      value={selectedCategory}
      onValueChange={(val: LeadCategory | null) => {
        if (val) {
          onValueChange(val.label);
        }
      }}
      itemToStringValue={(cat: LeadCategory) => cat?.label ?? ""}
      itemToStringLabel={(cat: LeadCategory) => cat?.label ?? ""}
      isItemEqualToValue={(a: LeadCategory, b: LeadCategory) => a?.id === b?.id}
    >
      <ComboboxInput
        placeholder={placeholder}
        className={className || "w-full h-10"}
      />
      <ComboboxContent className="min-w-64 max-h-80">
        <ComboboxEmpty>No categories found.</ComboboxEmpty>
        <ComboboxList>
          {(cat: LeadCategory) => (
            <ComboboxItem key={cat.id} value={cat}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {cat.label}
                  </ItemTitle>
                  <ItemDescription>
                    {cat.sector}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
