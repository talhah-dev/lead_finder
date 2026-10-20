"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, Tag, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CategoryItem, WorldCountry, CustomCtry } from "@/types/admin";
import { AddCategoryDialog } from "@/components/admin/add-category-dialog";

export function CategoriesView() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const {
    data: catData,
    isLoading: isLoadingCategories,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load categories");
      return (json.categories || []) as CategoryItem[];
    },
  });

  const { data: worldCountries } = useQuery({
    queryKey: ["admin", "world-countries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/world-data?type=countries");
      const json = await res.json();
      return (json.countries || []) as WorldCountry[];
    },
  });

  const { data: locData } = useQuery({
    queryKey: ["admin", "locations-countries"],
    queryFn: async () => {
      const res = await fetch("/api/admin/locations");
      const json = await res.json();
      return (json.countries || []) as CustomCtry[];
    },
  });

  const rawCatData = catData as unknown;
  const categories: CategoryItem[] = Array.isArray(rawCatData)
    ? (rawCatData as CategoryItem[])
    : typeof rawCatData === "object" && rawCatData !== null && "categories" in rawCatData
      ? (((rawCatData as { categories: unknown }).categories || []) as CategoryItem[])
      : [];

  const addMutation = useMutation({
    mutationFn: async ({ name, countryId }: { name: string; countryId: string | null }) => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, countryId, sector: "General" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to add category");
      return json;
    },
    onSuccess: (_, variables) => {
      toast.success(`Added "${variables.name}"`);
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to add category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string; name: string }) => {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete category");
      return json;
    },
    onSuccess: (_, variables) => {
      toast.success(`Removed "${variables.name}"`);
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete category");
    },
  });

  const countryMap = useMemo(() => {
    const map = new Map<string, string>();
    if (worldCountries && Array.isArray(worldCountries)) {
      for (const c of worldCountries) {
        map.set(c.code, `${c.flag || "🌐"} ${c.name}`);
        map.set(c.code.toLowerCase(), `${c.flag || "🌐"} ${c.name}`);
      }
    }
    if (locData && Array.isArray(locData)) {
      for (const c of locData) {
        map.set(c.id, c.name);
      }
    }
    return map;
  }, [worldCountries, locData]);

  const activeScopes = useMemo(() => {
    const set = new Set<string>();
    for (const c of categories) {
      if (c.countryId) set.add(c.countryId);
    }
    return Array.from(set);
  }, [categories]);

  const filteredCategories = categories.filter((c) => {
    if (filter && !c.name.toLowerCase().includes(filter.toLowerCase())) {
      return false;
    }
    if (scopeFilter === "global") {
      return c.countryId === null;
    }
    if (scopeFilter !== "all") {
      return c.countryId === scopeFilter;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <Select value={scopeFilter} onValueChange={(val) => setScopeFilter(val ?? "all")}>
            <SelectTrigger className="w-56 h-9 text-xs">
              <SelectValue placeholder="Filter by scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              <SelectItem value="global">Global Only</SelectItem>
              {activeScopes.map((code) => (
                <SelectItem key={code} value={code}>
                  {countryMap.get(code) || code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            size="icon-xs"
            variant="outline"
            onClick={() => refetch()}
            title="Refresh"
            className="size-8"
          >
            {isFetching ? (
              <Spinner className="size-3.5" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-9 text-xs gap-1.5"
          >
            <Plus className="size-3.5" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      <Card className="border shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Category Name</TableHead>
              <TableHead className="text-xs">Target Scope</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingCategories ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-44" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-6 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-28 text-center text-xs text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="size-3.5 text-muted-foreground" />
                      <span>{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {cat.countryId ? (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {countryMap.get(cat.countryId) || cat.countryId}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        Global
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate({ id: cat.id, name: cat.name })}
                      className="size-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AddCategoryDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAddCategory={async (name, countryId) => {
          await addMutation.mutateAsync({ name, countryId });
        }}
      />
    </div>
  );
}
