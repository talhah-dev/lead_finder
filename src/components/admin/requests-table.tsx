"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle2, XCircle, Trash2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AccessReq } from "@/types/admin";
import { cn } from "@/lib/utils";

export function RequestsTable() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/requests");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch requests");
      return (json.requests || []) as AccessReq[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to update request");
      return json;
    },
    onSuccess: (_, variables) => {
      toast.success(`Request marked as ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update request");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/requests?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to delete request");
      return json;
    },
    onSuccess: () => {
      toast.success("Request removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete request");
    },
  });

  const rawData = data as unknown;
  const requests: AccessReq[] = Array.isArray(rawData)
    ? (rawData as AccessReq[])
    : typeof rawData === "object" && rawData !== null && "requests" in rawData
      ? (((rawData as { requests: unknown }).requests || []) as AccessReq[])
      : [];

  const filteredRequests = requests.filter((r) => {
    if (!filter) return true;
    const term = filter.toLowerCase();
    return (
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term)
    );
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search requests by name or email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge variant="secondary" className="text-xs">
            {pendingCount} pending approval
          </Badge>
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
        </div>
      </div>

      <Card className="border shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">User / Requester</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Requested</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-6 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-xs text-muted-foreground">
                  No access requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium text-xs">
                    <div className="flex items-center gap-2">
                      <span>{req.name}</span>
                      {req.role === "admin" && (
                        <Badge variant="secondary" className="text-[10px] py-0">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {req.email}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "approved"
                          ? "default"
                          : req.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[10px] capitalize font-medium"
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status === "pending" && (
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={updateMutation.isPending}
                            onClick={() =>
                              updateMutation.mutate({ id: req.id, status: "approved" })
                            }
                            className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700"
                          >
                            <CheckCircle2 className="size-3" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={updateMutation.isPending}
                            onClick={() =>
                              updateMutation.mutate({ id: req.id, status: "rejected" })
                            }
                            className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                          >
                            <XCircle className="size-3" />
                            <span>Reject</span>
                          </Button>
                        </>
                      )}

                      {req.status === "approved" && (
                        <Button
                          size="xs"
                          variant="ghost"
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({ id: req.id, status: "rejected" })
                          }
                          className="h-7 text-xs gap-1 text-amber-600 hover:text-amber-700"
                        >
                          <XCircle className="size-3" />
                          <span>Revoke</span>
                        </Button>
                      )}

                      {req.status === "rejected" && (
                        <Button
                          size="xs"
                          variant="outline"
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({ id: req.id, status: "approved" })
                          }
                          className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <CheckCircle2 className="size-3" />
                          <span>Approve</span>
                        </Button>
                      )}

                      <Button
                        size="icon-xs"
                        variant="ghost"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(req.id)}
                        className="size-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
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
