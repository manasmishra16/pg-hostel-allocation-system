"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Property } from "@/lib/api";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  MapPin,
  Bed,
  ArrowLeft,
  Layers,
  Sparkles,
  Users,
  ShieldCheck,
  Wrench,
  ChevronRight,
  ExternalLink,
  Plus,
} from "lucide-react";

export default function OwnerPropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProperty(propertyId);
      setProperty(data);
    } catch (err) {
      console.error("Failed to load property details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-64 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="glass-card p-16 text-center rounded-3xl border border-white/5 space-y-4">
        <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">Property Not Found</h3>
        <p className="text-xs text-slate-400">The requested property does not exist or access is restricted.</p>
        <Link
          href="/owner/properties"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>
      </div>
    );
  }

  const totBeds = property.total_beds || 0;
  const occBeds = property.occupied_beds || 0;
  const occRate = totBeds > 0 ? Math.round((occBeds / totBeds) * 100) : 0;
  const buildings = property.buildings || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/owner/properties" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Properties Portfolio
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{property.name}</span>
      </div>

      {/* Hero Property Overview */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full bg-slate-800">
          <img
            src={
              property.images?.[0] ||
              "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200"
            }
            alt={property.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              {property.property_type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 backdrop-blur-md">
              {property.gender_type}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{property.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                {property.address}, {property.locality}, {property.city} - {property.pincode}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/owner/rooms?property_id=${property.id}`}
                className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Manage Floor & Beds</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5 p-4 sm:p-6 bg-white/[0.01]">
          <div className="p-3 text-center sm:text-left">
            <div className="text-xs text-slate-400 font-semibold">Total Capacity</div>
            <div className="text-2xl font-black text-white mt-1">{totBeds} Beds</div>
          </div>
          <div className="p-3 text-center sm:text-left">
            <div className="text-xs text-slate-400 font-semibold">Active Residents</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{occBeds} Occupied</div>
          </div>
          <div className="p-3 text-center sm:text-left">
            <div className="text-xs text-slate-400 font-semibold">Occupancy Rate</div>
            <div className="text-2xl font-black text-teal-400 mt-1">{occRate}%</div>
          </div>
          <div className="p-3 text-center sm:text-left">
            <div className="text-xs text-slate-400 font-semibold">Base Rent</div>
            <div className="text-2xl font-black text-white mt-1">
              {formatCurrency(property.starting_price || property.starting_rent || 8000)}/mo
            </div>
          </div>
        </div>
      </div>

      {/* Buildings & Floors Architecture */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Building Hierarchy & Floor Blueprints</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Physical distribution of wings, floors, and rooms</p>
          </div>
          <Link
            href={`/owner/rooms?property_id=${property.id}`}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Live Bed Grid</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {buildings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No building records found for this property. Configure floors and rooms in Bed Management.
          </div>
        ) : (
          <div className="space-y-6">
            {buildings.map((b) => (
              <div key={b.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    {b.name} ({b.total_floors} Floors)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(b.floors || []).map((f) => {
                    const roomCount = f.rooms?.length || 0;
                    const bedCount = f.rooms?.reduce((acc, r) => acc + (r.beds?.length || r.capacity || 0), 0) || 0;
                    const occInFloor = f.rooms?.reduce((acc, r) => acc + (r.occupied_count || 0), 0) || 0;

                    return (
                      <div
                        key={f.id}
                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{f.floor_name}</span>
                          <span className="text-xs text-emerald-400 font-semibold">{roomCount} Rooms</span>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Bed Capacity:</span>
                            <span className="font-semibold text-white">{bedCount} beds</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Occupancy:</span>
                            <span className="font-semibold text-emerald-400">{occInFloor} / {bedCount}</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Link
                            href={`/owner/rooms?property_id=${property.id}&floor_id=${f.id}`}
                            className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>Inspect Floor</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amenities & Property Description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Amenities & Facilities</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {(property.amenities || property.rules_json || ["WiFi", "Security", "Housekeeping"]).map((amenity, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white">About Property</h3>
          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            {property.description ||
              "Premium student & working professional accommodation with fully equipped rooms, high-speed WiFi, 24/7 security, and professional facility management."}
          </p>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Property ID: {property.id.slice(0, 12)}</span>
            <span>Registered: {new Date(property.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
