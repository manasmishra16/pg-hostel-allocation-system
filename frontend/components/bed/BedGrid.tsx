"use client";

import React, { useState } from "react";
import { Bed } from "@/types";
import { BedItem } from "./BedItem";
import { BedActionModal } from "./BedActionModal";
import { cn } from "@/lib/utils";

export interface BedGridProps {
  beds: Bed[];
  roomNumber?: string;
  allowActions?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export const BedGrid: React.FC<BedGridProps> = ({
  beds,
  roomNumber,
  allowActions = true,
  onRefresh,
  className,
}) => {
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

  return (
    <>
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", className)}>
        {beds.map((bed) => (
          <BedItem
            key={bed.id}
            bed={bed}
            onClick={() => {
              if (allowActions) setSelectedBed(bed);
            }}
          />
        ))}
      </div>

      {allowActions && (
        <BedActionModal
          bed={selectedBed}
          roomNumber={roomNumber}
          isOpen={!!selectedBed}
          onClose={() => setSelectedBed(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
};
