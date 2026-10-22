"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { WorldCountry } from "@/types/admin";

export interface ScopeOption {
  id: string;
  label: string;
  flag: string;
  code: string;
}

const GLOBAL_SCOPE: ScopeOption = {
  id: "global",
  label: "Global (Available Everywhere)",
  flag: "🌐",
  code: "ALL",
};

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (name: string, countryId: string | null) => Promise<void>;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onAddCategory,
}: AddCategoryDialogProps) {
  const [name, setName] = useState("");
  const [selectedScope, setSelectedScope] = useState<ScopeOption>(GLOBAL_SCOPE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: worldCountries } = useQuery({
    queryKey: ["admin", "world-countries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/world-data?type=countries");
      const json = await res.json();
      return (json.countries || []) as WorldCountry[];
    },
  });

  const scopeOptions: ScopeOption[] = useMemo(() => {
    const list: ScopeOption[] = [GLOBAL_SCOPE];
    if (worldCountries && Array.isArray(worldCountries)) {
      for (const c of worldCountries) {
        list.push({
          id: c.code,
          label: `${c.name} (${c.code})`,
          flag: c.flag || "🌐",
          code: c.code,
        });
      }
    }
    return list;
  }, [worldCountries]);

  const handleSelectAll = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    target.select();
    requestAnimationFrame(() => {
      target.select();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const countryId = selectedScope.id === "global" ? null : selectedScope.id;
      await onAddCategory(name.trim(), countryId);
      setName("");
      setSelectedScope(GLOBAL_SCOPE);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Create a custom business category for lead prospecting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Category Name</label>
            <Input
              placeholder="e.g., Solar Panel Installers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 text-xs"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Target Scope</label>
            <Combobox
              items={scopeOptions}
              value={selectedScope}
              onValueChange={(val: ScopeOption | null) => {
                if (val) {
                  setSelectedScope(val);
                }
              }}
              itemToStringValue={(opt: ScopeOption) => opt?.label ?? ""}
              itemToStringLabel={(opt: ScopeOption) => opt?.label ?? ""}
              isItemEqualToValue={(a: ScopeOption, b: ScopeOption) =>
                a?.id === b?.id
              }
            >
              <ComboboxInput
                placeholder="Type country name or search..."
                className="w-full h-9 text-xs"
                onFocus={handleSelectAll}
                onClick={handleSelectAll}
              />
              <ComboboxContent className="min-w-72 max-h-72">
                <ComboboxEmpty>No countries found.</ComboboxEmpty>
                <ComboboxList>
                  {(opt: ScopeOption) => (
                    <ComboboxItem key={opt.id} value={opt}>
                      <div className="flex items-center justify-between w-full text-xs py-0.5">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-sm shrink-0">{opt.flag}</span>
                          <span className="truncate">{opt.label}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground ml-2 shrink-0">
                          {opt.code}
                        </span>
                      </div>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Save Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
