"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import {
  Layers,
  Building2,
  Users,
  ShieldCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  Plus,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  legalEntity: string;
  contactEmail: string;
  contactPhone: string;
  propertiesCount: number;
  totalBeds: number;
  tier: "ENTERPRISE" | "STANDARD" | "INSTITUTIONAL";
  isVerified: boolean;
}

export default function AdminOrganizationsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const organizations: Organization[] = [
    {
      id: "org-1",
      name: "StayNest Living Private Limited",
      legalEntity: "StayNest Hospitality India LLP (CIN: U70109KA2024PTC189)",
      contactEmail: "admin@staynest.internal",
      contactPhone: "+91 80 4567 8900",
      propertiesCount: properties.length || 3,
      totalBeds: properties.reduce((acc, p) => acc + (p.total_beds || 0), 0) || 72,
      tier: "ENTERPRISE",
      isVerified: true,
    },
    {
      id: "org-2",
      name: "Bengaluru Tech Campus Hostels",
      legalEntity: "HSR Student Housing Trust",
      contactEmail: "campus@hsrhostels.edu",
      contactPhone: "+91 80 2345 6789",
      propertiesCount: 1,
      totalBeds: 48,
      tier: "INSTITUTIONAL",
      isVerified: true,
    },
    {
      id: "org-3",
      name: "Green Glen Premium Stays",
      legalEntity: "Vikramaditya Real Estate Ventures",
      contactEmail: "vikram@greenglen.co.in",
      contactPhone: "+91 98765 22334",
      propertiesCount: 1,
      totalBeds: 24,
      tier: "STANDARD",
      isVerified: true,
    },
  ];

  useEffect(() => {
    loadProps();
  }, [user]);

  const loadProps = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProperties();
      setProperties(data || []);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.legalEntity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Organization & Campus Entities"
          subtitle="Enterprise hospitality groups, institutional universities, and multi-facility operators."
        />

        <button
          onClick={() => alert("Enterprise onboarding: register verified operator.")}
          className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Organization</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organization or CIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{filtered.length} Entities Enrolled</span>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((org) => (
          <div
            key={org.id}
            className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                  {org.tier}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{org.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{org.legalEntity}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Managed Properties:</span>
                  <span className="font-bold text-white">{org.propertiesCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Bed Capacity:</span>
                  <span className="font-bold text-emerald-400">{org.totalBeds} Beds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contact:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{org.contactEmail}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Fully Compliant
              </span>
              <span className="text-slate-500">ID: {org.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
