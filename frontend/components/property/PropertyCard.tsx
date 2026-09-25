import React from "react";
import Link from "next/link";
import { Property } from "@/types";
import { MapPin, ShieldCheck, BedDouble, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export interface PropertyCardProps {
  property: Property;
  manageHref?: string;
  showManageActions?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  manageHref,
  showManageActions = false,
}) => {
  const occupancyPercent =
    property.total_beds && property.total_beds > 0
      ? Math.round((property.occupied_beds / property.total_beds) * 100)
      : 0;

  return (
    <Card hover className="p-0 overflow-hidden flex flex-col group">
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
        <img
          src={property.cover_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={property.property_type === "PG" ? "emerald" : "blue"}>
            {property.property_type === "PG" ? "PG Living" : "Student Hostel"}
          </Badge>
        </div>
        {property.is_verified && (
          <div className="absolute top-3 right-3">
            <Badge variant="emerald" size="sm">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
            {property.name}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{property.locality}, {property.city}</span>
          </p>
        </div>

        {/* Capacity / Occupancy Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400 block text-[10px]">Total Beds</span>
            <span className="font-bold text-white flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-emerald-400" />
              <span>{property.total_beds} Beds</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400 block text-[10px]">Occupancy</span>
            <span className="font-bold text-emerald-400">
              {occupancyPercent}% ({property.occupied_beds} occ)
            </span>
          </div>
        </div>

        {/* Pricing & Action */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs text-slate-400 block text-[10px]">Starting From</span>
            <span className="text-sm font-extrabold text-white">
              {formatCurrency(property.starting_rent)}
              <span className="text-[10px] text-slate-400 font-normal">/mo</span>
            </span>
          </div>

          <Link
            href={manageHref || `/properties/${property.id}`}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-bold transition-all flex items-center gap-1 shadow"
          >
            <span>{showManageActions ? "Manage Stays" : "View Beds"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
