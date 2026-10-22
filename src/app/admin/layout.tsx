"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && pathname !== "/admin/login") {
      if (!user || user.role !== "admin" || user.status !== "approved") {
        router.replace("/admin/login");
      }
    }
  }, [isLoading, user, pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading || !user || user.role !== "admin" || user.status !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  const getPageTitle = () => {
    if (pathname === "/admin/requests") return "User Access Requests & Permissions";
    if (pathname === "/admin/locations") return "Countries & Regional Subdivisions";
    if (pathname === "/admin/categories") return "Global Services & Custom Categories";
    if (pathname === "/admin/removed-leads") return "Excluded & Blacklisted Leads";
    return "Platform Overview & Activity";
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-14 border-b flex items-center justify-between px-6 bg-card/60 backdrop-blur-sm sticky top-0 z-10">
          <h2 className="text-sm font-semibold capitalize tracking-tight">
            {getPageTitle()}
          </h2>
          <Badge variant="outline" className="text-xs font-normal">
            Status: PostgreSQL Live
          </Badge>
        </header>

        <div className="p-6 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
