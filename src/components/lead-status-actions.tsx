"use client";

import { useState } from "react";
import {
  Check,
  X,
  Clock,
  CalendarClock,
  ThumbsUp,
  RotateCcw,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadStatus } from "@/types/lead";
import { cn } from "@/lib/utils";

interface LeadStatusActionsProps {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  compact?: boolean;
}

interface StatusConfig {
  status: LeadStatus;
  label: string;
  description: string;
  icon: typeof Check;
  activeColor: string;
  hoverColor: string;
  badgeBg: string;
}

const STATUS_CONFIGS: StatusConfig[] = [
  {
    status: "Approved",
    label: "Approved / Completed",
    description: "Conversation complete & client agreed",
    icon: Check,
    activeColor: "text-emerald-600 dark:text-emerald-400",
    hoverColor: "hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
    badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
  },
  {
    status: "Rejected",
    label: "Rejected",
    description: "Client declined or not interested",
    icon: X,
    activeColor: "text-rose-600 dark:text-rose-400",
    hoverColor: "hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40",
    badgeBg: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300",
  },
  {
    status: "Pending",
    label: "Pending",
    description: "Waiting for reply or decision",
    icon: Clock,
    activeColor: "text-amber-600 dark:text-amber-400",
    hoverColor: "hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40",
    badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  {
    status: "Follow Up",
    label: "Call Tomorrow",
    description: "Client requested call tomorrow",
    icon: CalendarClock,
    activeColor: "text-sky-600 dark:text-sky-400",
    hoverColor: "hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40",
    badgeBg: "bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300",
  },
  {
    status: "Interested",
    label: "Interested",
    description: "Prospect is interested in services",
    icon: ThumbsUp,
    activeColor: "text-violet-600 dark:text-violet-400",
    hoverColor: "hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40",
    badgeBg: "bg-violet-500/15 border-violet-500/30 text-violet-700 dark:text-violet-300",
  },
];

export function LeadStatusActions({
  leadId,
  currentStatus,
  onStatusChange,
  compact = false,
}: LeadStatusActionsProps) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus || "New");

  const effectiveStatus = currentStatus || status;
  const activeConfig = STATUS_CONFIGS.find((c) => c.status === effectiveStatus);

  const handleSelectStatus = async (newStatus: LeadStatus) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(leadId, newStatus);
    }

    try {
      await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
    } catch {}
  };

  if (activeConfig) {
    const ActiveIcon = activeConfig.icon;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors cursor-pointer",
            activeConfig.badgeBg
          )}
          onClick={(e) => e.stopPropagation()}
          title={`${activeConfig.label} • Click to change`}
        >
          <ActiveIcon className="size-3.5 shrink-0" />
          {!compact && <span>{activeConfig.label}</span>}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-52" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel className="text-xs">Change Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {STATUS_CONFIGS.map((cfg) => {
            const ItemIcon = cfg.icon;
            const isSelected = cfg.status === effectiveStatus;
            return (
              <DropdownMenuItem
                key={cfg.status}
                onClick={() => handleSelectStatus(cfg.status)}
                className="cursor-pointer gap-2 py-1.5"
              >
                <ItemIcon className={cn("size-3.5", cfg.activeColor)} />
                <div className="flex flex-col flex-1">
                  <span className={cn("text-xs", isSelected && "font-semibold")}>
                    {cfg.label}
                  </span>
                </div>
                {isSelected && <span className="size-1.5 rounded-full bg-primary" />}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleSelectStatus("New")}
            className="cursor-pointer gap-2 py-1.5 text-muted-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span className="text-xs">Reset to Unset</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <TooltipProvider delay={100}>
      <div
        className="inline-flex items-center gap-1 p-0.5 rounded-lg border bg-muted/20"
        onClick={(e) => e.stopPropagation()}
      >
        {STATUS_CONFIGS.map((cfg) => {
          const Icon = cfg.icon;
          return (
            <Tooltip key={cfg.status}>
              <TooltipTrigger
                className={cn(
                  "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-all cursor-pointer",
                  cfg.hoverColor
                )}
                onClick={() => handleSelectStatus(cfg.status)}
                aria-label={cfg.label}
              >
                <Icon className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-semibold text-xs">{cfg.label}</p>
                <p className="text-[11px] opacity-80">{cfg.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
