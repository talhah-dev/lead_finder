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
import { US_STATES_DATA, type USState } from "@/data/mockLeads";

interface StateComboboxProps {
  value?: string;
  onValueChange: (state: string) => void;
  className?: string;
  placeholder?: string;
}

export function StateCombobox({
  value,
  onValueChange,
  className,
  placeholder = "Search state...",
}: StateComboboxProps) {
  const selectedState = useMemo(() => {
    return (
      US_STATES_DATA.find(
        (s) => s.label.toLowerCase() === (value || "All States").toLowerCase()
      ) || US_STATES_DATA[0]
    );
  }, [value]);

  const handleSelectAll = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    target.select();
    requestAnimationFrame(() => {
      target.select();
    });
  };

  return (
    <Combobox
      items={US_STATES_DATA}
      value={selectedState}
      onValueChange={(val: USState | null) => {
        if (val) {
          onValueChange(val.label);
        }
      }}
      itemToStringValue={(state: USState) => state?.label ?? ""}
      itemToStringLabel={(state: USState) => state?.label ?? ""}
      isItemEqualToValue={(a: USState, b: USState) => a?.code === b?.code}
    >
      <ComboboxInput
        placeholder={placeholder}
        className={className || "w-full h-10"}
        onFocus={handleSelectAll}
        onClick={handleSelectAll}
      />
      <ComboboxContent className="min-w-64 max-h-80">
        <ComboboxEmpty>No states found.</ComboboxEmpty>
        <ComboboxList>
          {(state: USState) => (
            <ComboboxItem key={state.code} value={state}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="whitespace-nowrap">
                    {state.label}
                  </ItemTitle>
                  <ItemDescription>
                    {state.region} ({state.code})
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

export const ComboboxWithCustomItems = StateCombobox;
