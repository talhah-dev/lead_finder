"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Users,
  Globe,
  Tag,
  Ban,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["admin", "requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/requests");
      const json = await res.json();
      return (json.requests || []) as { status: string }[];
    },
  });

  const rawData = data as unknown;
  const requests = Array.isArray(rawData)
    ? (rawData as { status: string }[])
    : typeof rawData === "object" && rawData !== null && "requests" in rawData
      ? (((rawData as { requests: unknown }).requests || []) as { status: string }[])
      : [];

  const pendingCount = requests.filter(
    (r: { status: string }) => r.status === "pending"
  ).length;

  const navItems = [
    {
      href: "/admin",
      label: "Overview",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/requests",
      label: "Access Requests",
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      href: "/admin/locations",
      label: "Countries & Regions",
      icon: Globe,
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: Tag,
    },
    {
      href: "/admin/removed-leads",
      label: "Removed Leads",
      icon: Ban,
    },
  ];

  return (
    <aside className="w-64 border-r bg-card flex flex-col shrink-0">
      <div className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <ShieldCheck className="size-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Admin Console</span>
        </div>
      </div>

      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="size-4" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <Badge
                  variant={isActive ? "secondary" : "default"}
                  className="text-[10px] h-5 px-1.5 font-semibold"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-2">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="size-3.5" />
            <span>Open GetLead</span>
          </div>
          <ChevronRight className="size-3" />
        </Link>

        <div className="flex items-center justify-between pt-1 px-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium truncate max-w-[120px]">Administrator</span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              admin@getlead.com
            </span>
          </div>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("getlead_auth");
              localStorage.removeItem("mapscout_auth");
              toast.info("Signed out");
              router.push("/admin/login");
            }}
            title="Sign Out"
            className="size-7 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
