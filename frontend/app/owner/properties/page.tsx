"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property } from "@/lib/api";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Bed,
  TrendingUp,
  ArrowRight,
  Shield,
  Layers,
  Filter,
} from "lucide-react";

export default function OwnerPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PG" | "HOSTEL">("ALL");

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProperties();
      setProperties(data || []);
    } catch (err) {
      console.error("Failed to load owner properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.locality.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === "ALL" || p.property_type.toUpperCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Property Portfolio"
          subtitle="Direct operational management for buildings, floor blueprints, and rates."
        />

        <Link
          href="/owner/properties/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(["ALL", "PG", "HOSTEL"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === t
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {t === "ALL" ? "All Formats" : t === "PG" ? "Luxury PGs" : "Hostel Blocks"}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border border-white/5">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No properties match your filter</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Adjust your search query or add a new property listing to your portfolio.
          </p>
          <Link
            href="/owner/properties/new"
            className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((p) => {
            const totBeds = p.total_beds || 0;
            const occBeds = p.occupied_beds || 0;
            const vacantBeds = Math.max(0, totBeds - occBeds);
            const occRate = totBeds > 0 ? Math.round((occBeds / totBeds) * 100) : 0;

            return (
              <div
                key={p.id}
                className="glass-card rounded-3xl border border-white/5 overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-800">
                    <img
                      src={
                        p.images?.[0] ||
                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
                      }
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {p.property_type}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 backdrop-blur-md">
                        {p.gender_type}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h4 className="text-base font-bold text-white truncate">{p.name}</h4>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{p.locality}, {p.city}</span>
                      </p>
                    </div>
                  </div>

                  {/* Bed & Rent Metrics */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Starting Rent</span>
                      <span className="font-extrabold text-emerald-400">
                        {formatCurrency(p.starting_price || 8000)}/month
                      </span>
                    </div>

                    {/* Occupancy Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold">Occupancy Rate</span>
                        <span className="font-bold text-white">{occRate}% ({occBeds}/{totBeds} beds)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, occRate)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Total</div>
                        <div className="text-xs font-bold text-white mt-0.5">{totBeds}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Occupied</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">{occBeds}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-slate-500 font-semibold uppercase">Vacant</div>
                        <div className="text-xs font-bold text-blue-400 mt-0.5">{vacantBeds}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                  <Link
                    href={`/owner/properties/${p.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold text-center border border-white/10 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/owner/rooms?property_id=${p.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold text-center border border-emerald-500/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Manage Beds</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
