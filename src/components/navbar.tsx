"use client";

import { MapPin, Download, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  onExportClick: () => void;
  totalLeads: number;
}

export function Navbar({ onExportClick, totalLeads }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="size-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight">MapScout</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">

          <Badge variant="outline" className="hidden md:inline-flex items-center gap-1 font-mono text-xs">
            <Layers className="size-3" />
            {totalLeads} Leads Loaded
          </Badge>

          <Button size="sm" onClick={onExportClick} className="gap-1.5">
            <Download className="size-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
