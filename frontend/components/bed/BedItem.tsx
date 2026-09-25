"use client";

import React from "react";
import { Bed } from "@/types";
import { BedDouble, User } from "lucide-react";
import { BedStatusBadge } from "./BedStatusBadge";
import { cn } from "@/lib/utils";

export interface BedItemProps {
  bed: Bed;
  onClick?: () => void;
  className?: string;
  isCurrentUser?: boolean;
}

export const BedItem: React.FC<BedItemProps> = ({
  bed,
  onClick,
  className,
  isCurrentUser = false,
}) => {
  const isAvailable = bed.status === "AVAILABLE";
  const isOccupied = bed.status === "OCCUPIED";

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between select-none cursor-pointer",
        isCurrentUser
          ? "bg-emerald-500/15 border-emerald-400 text-white ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/15"
          : isAvailable
          ? "bg-emerald-500/[0.04] border-emerald-500/30 text-slate-200 hover:border-emerald-500 hover:bg-emerald-500/10"
          : isOccupied
          ? "bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20"
          : "bg-amber-500/[0.04] border-amber-500/20 text-slate-300 hover:border-amber-500/40",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BedDouble className={cn("w-4 h-4", isAvailable ? "text-emerald-400" : isCurrentUser ? "text-emerald-300" : "text-slate-400")} />
          <span className="text-xs font-bold">{bed.bed_code}</span>
        </div>
        <BedStatusBadge status={bed.status} size="sm" />
      </div>

      <div className="mt-3 pt-2 border-t border-white/5 space-y-1">
        {bed.current_tenant_name ? (
          <div className="text-[11px] text-white font-medium flex items-center gap-1.5 truncate">
            <User className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{isCurrentUser ? "You (Allocated)" : bed.current_tenant_name}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">
            {isAvailable ? "Ready for occupancy" : "Not available"}
          </div>
        )}
        <div className="text-[10px] text-slate-400">
          ₹{bed.monthly_rent?.toLocaleString()}/mo
        </div>
      </div>
    </div>
  );
};
