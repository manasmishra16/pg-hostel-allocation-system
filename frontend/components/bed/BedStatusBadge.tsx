import React from "react";
import { BedStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

export const BedStatusBadge: React.FC<{ status: BedStatus; size?: "sm" | "md" }> = ({
  status,
  size = "md",
}) => {
  switch (status) {
    case "AVAILABLE":
      return (
        <Badge variant="emerald" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Available</span>
        </Badge>
      );
    case "OCCUPIED":
      return (
        <Badge variant="slate" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          <span>Occupied</span>
        </Badge>
      );
    case "MAINTENANCE":
      return (
        <Badge variant="amber" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Maintenance</span>
        </Badge>
      );
    case "RESERVED":
      return (
        <Badge variant="purple" size={size}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>Reserved</span>
        </Badge>
      );
    default:
      return <Badge variant="slate" size={size}>{status}</Badge>;
  }
};
