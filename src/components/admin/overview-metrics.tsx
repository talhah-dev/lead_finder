"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Globe,
  Tag,
  Ban,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewMetrics() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: async () => {
      const [reqRes, locRes, catRes, blkRes] = await Promise.all([
        fetch("/api/admin/requests"),
        fetch("/api/admin/world-data?type=countries"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/removed-leads"),
      ]);
      const [reqData, locData, catData, blkData] = await Promise.all([
        reqRes.json(),
        locRes.json(),
        catRes.json(),
        blkRes.json(),
      ]);

      const requestsList = reqData.requests || [];
      return {
        requests: requestsList.length,
        pendingRequests: requestsList.filter((r: { status: string }) => r.status === "pending").length,
        countries: locData.countries?.length || 250,
        categories: catData.categories?.length || 0,
        removedLeads: blkData.leads?.length || 0,
      };
    },
  });

  const stats = data || {
    requests: 0,
    pendingRequests: 0,
    countries: 250,
    categories: 0,
    removedLeads: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Key Performance Indicators</h3>
        <Button
          size="icon-xs"
          variant="outline"
          onClick={() => refetch()}
          title="Refresh metrics"
          className="size-7"
        >
          {isFetching ? <Spinner className="size-3.5" /> : <RefreshCw className="size-3.5" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Access Requests
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats.requests}</div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-28" />
              ) : stats.pendingRequests > 0 ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <Clock className="size-3" />
                  {stats.pendingRequests} awaiting review
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  All caught up
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              World Countries
            </CardTitle>
            <Globe className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats.countries}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Complete world directory
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <Tag className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats.categories}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Active prospect niches
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Excluded Leads
            </CardTitle>
            <Ban className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <div className="text-2xl font-bold">{stats.removedLeads}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Suppressed from results
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <span>Access Control</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Manage user registrations, approve client accounts, and revoke permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/requests"
              className={buttonVariants({ variant: "outline", size: "sm" }) + " text-xs gap-1.5"}
            >
              <span>View User Requests</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <span>Locations & Directory</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Browse pre-defined world countries, states, provinces, and cities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/locations"
              className={buttonVariants({ variant: "outline", size: "sm" }) + " text-xs gap-1.5"}
            >
              <span>Explore Countries & States</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
