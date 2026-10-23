"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Ban, RotateCcw, RefreshCw, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { BlacklistedLead } from "@/types/admin";
import { cleanPhone } from "@/lib/deduplicate";

export function RemovedLeadsView() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");

  const {
    data: leadsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "removed-leads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/removed-leads");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load excluded leads");
      return (json.leads || []) as BlacklistedLead[];
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/admin/removed-leads?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to restore lead");
      return { id, name };
    },
    onSuccess: (data) => {
      toast.success(`Restored "${data.name}" to search pool`);
      queryClient.invalidateQueries({ queryKey: ["admin", "removed-leads"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to restore lead");
    },
  });

  const rawLeadsData = leadsData as unknown;
  const leads: BlacklistedLead[] = Array.isArray(rawLeadsData)
    ? (rawLeadsData as BlacklistedLead[])
    : typeof rawLeadsData === "object" && rawLeadsData !== null && "leads" in rawLeadsData
      ? (((rawLeadsData as { leads: unknown }).leads || []) as BlacklistedLead[])
      : [];

  const filteredLeads = leads.filter((l) => {
    if (!filter) return true;
    const term = filter.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      (l.phone && l.phone.toLowerCase().includes(term)) ||
      (l.website && l.website.toLowerCase().includes(term)) ||
      (l.reason && l.reason.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search excluded leads..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Button
          size="icon-xs"
          variant="outline"
          onClick={() => refetch()}
          title="Refresh"
          className="size-8 self-end sm:self-auto"
        >
          {isFetching ? (
            <Spinner className="size-3.5" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
        </Button>
      </div>

      <Card className="border shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Business Name</TableHead>
              <TableHead className="text-xs">Phone</TableHead>
              <TableHead className="text-xs">Website</TableHead>
              <TableHead className="text-xs">Reason</TableHead>
              <TableHead className="text-xs">Excluded Date</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                  No excluded leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium text-xs">
                    <div className="flex items-center gap-2">
                      <Ban className="size-3.5 text-muted-foreground" />
                      <span>{lead.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {cleanPhone(lead.phone) || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {lead.website ? (
                      <a
                        href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline text-primary"
                      >
                        <span className="truncate max-w-[140px]">{lead.website.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {lead.reason || "Excluded by user"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={restoreMutation.isPending}
                      onClick={() => restoreMutation.mutate({ id: lead.id, name: lead.name })}
                      className="h-7 text-xs gap-1"
                    >
                      <RotateCcw className="size-3" />
                      <span>Restore</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
