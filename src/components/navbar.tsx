"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Download, Layers, History, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onExportClick?: () => void;
  totalLeads?: number;
}

export function Navbar({ onExportClick, totalLeads = 0 }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="size-4" />
            </div>
            <span className="font-semibold text-base tracking-tight">MapScout</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                buttonVariants({
                  variant: pathname === "/" ? "secondary" : "ghost",
                  size: "sm",
                }),
                "h-8 text-xs gap-1.5 font-medium"
              )}
            >
              <Search className="size-3.5" />
              <span>Find Leads</span>
            </Link>

            <Link
              href="/history"
              className={cn(
                buttonVariants({
                  variant: pathname === "/history" ? "secondary" : "ghost",
                  size: "sm",
                }),
                "h-8 text-xs gap-1.5 font-medium"
              )}
            >
              <History className="size-3.5" />
              <span>History</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {totalLeads > 0 && (
            <Badge
              variant="outline"
              className="hidden md:inline-flex items-center gap-1 font-mono text-xs"
            >
              <Layers className="size-3" />
              {totalLeads} Leads
            </Badge>
          )}

          {onExportClick && (
            <Button size="sm" onClick={onExportClick} className="gap-1.5 h-8 text-xs">
              <Download className="size-3.5" />
              <span>Export</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
