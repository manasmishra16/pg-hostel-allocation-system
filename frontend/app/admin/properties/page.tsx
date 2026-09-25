"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property } from "@/lib/api";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Search,
  MapPin,
  CheckCircle2,
  Layers,
  Bed,
  ExternalLink,
} from "lucide-react";

export default function AdminPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProperties();
      setProperties(data || []);
    } catch (err) {
      console.error("Failed to load network properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.locality.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Network Property Directory"
        subtitle="Global platform inventory of luxury student housing, PG accommodations, and hostel buildings."
      />

      {/* Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search property, locality, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{filtered.length} Properties Enrolled</span>
      </div>

      {/* Property Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Network Facilities</h3>
          <p className="text-xs text-slate-400 mt-0.5">PostgreSQL verified property records</p>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Properties Found</h4>
            <p className="text-xs text-slate-400 mt-1">No property records matched your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white/[0.01]">
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Format</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Total Beds</th>
                  <th className="py-4 px-6">Occupancy</th>
                  <th className="py-4 px-6">Base Rent</th>
                  <th className="py-4 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filtered.map((p) => {
                  const tot = p.total_beds || 0;
                  const occ = p.occupied_beds || 0;
                  const rate = tot > 0 ? Math.round((occ / tot) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">{p.name}</div>
                        <div className="text-[11px] text-slate-500">ID #{p.id.slice(0, 8)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                          {p.property_type} · {p.gender_type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {p.locality}, {p.city}
                      </td>
                      <td className="py-4 px-6 font-semibold text-white">{tot}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">{rate}%</span>
                          <span className="text-slate-500 text-[11px]">({occ} beds)</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-white">
                        {formatCurrency(p.starting_price || p.starting_rent || 8000)}/mo
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
