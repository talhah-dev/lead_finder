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
import { CATEGORIES_DATA } from "@/data/mockLeads";

export interface CategoryOption {
  id: string;
  label: string;
  sector?: string;
}

interface CategoryComboboxProps {
  value?: string;
  onValueChange: (category: string) => void;
  className?: string;
  placeholder?: string;
  items?: CategoryOption[];
}

export function CategoryCombobox({
  value,
  onValueChange,
  className,
  placeholder = "Search category...",
  items,
}: CategoryComboboxProps) {
  const list = useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }
    return CATEGORIES_DATA.map((c) => ({
      id: c.id,
      label: c.label,
      sector: c.sector,
    }));
  }, [items]);

  const selectedCategory = useMemo(() => {
    if (!value || value === "All Categories") {
      return list[0] ?? null;
    }
    const match = list.find(
      (c) => c.label.toLowerCase() === value.toLowerCase()
    );
    return match ?? { id: "custom", label: value, sector: "Custom" };
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
      value={selectedCategory}
      onValueChange={(val: CategoryOption | null) => {
        if (val) {
          onValueChange(val.label);
        }
      }}
      itemToStringValue={(cat: CategoryOption) => cat?.label ?? ""}
      itemToStringLabel={(cat: CategoryOption) => cat?.label ?? ""}
      isItemEqualToValue={(a: CategoryOption, b: CategoryOption) =>
        a?.id === b?.id || a?.label === b?.label
      }
    >
      <ComboboxInput
        placeholder={placeholder}
        className={className || "w-full h-10"}
        onFocus={handleSelectAll}
        onClick={handleSelectAll}
      />
      <ComboboxContent className="min-w-64 max-h-80">
        <ComboboxEmpty>No categories found.</ComboboxEmpty>
        <ComboboxList>
          {(cat: CategoryOption) => (
            <ComboboxItem key={cat.id} value={cat}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {cat.label}
                  </ItemTitle>
                  {cat.sector && (
                    <ItemDescription>{cat.sector}</ItemDescription>
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
