"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property, DashboardStats } from "@/lib/api";
import Link from "next/link";
import {
  Building2,
  Bed,
  Users,
  IndianRupee,
  Plus,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  plumbing: "#10B981",
  wifi: "#3B82F6",
  electrical: "#F59E0B",
  cleanliness: "#14B8A6",
  food: "#EC4899",
  other: "#8B5CF6",
};

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [analytics, setAnalytics] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [props, stats] = await Promise.all([
        api.getProperties(),
        api.getOwnerAnalytics(),
      ]);
      setProperties(props || []);
      setAnalytics(stats);
    } catch (err) {
      console.error("Failed to load owner data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive dynamic property distribution from actual loaded properties
  const propertyDistributionData = properties.map((p) => ({
    name: p.name.length > 15 ? `${p.name.slice(0, 13)}...` : p.name,
    totalBeds: p.total_beds || 0,
    occupiedBeds: p.occupied_beds || 0,
    availableBeds: Math.max(0, (p.total_beds || 0) - (p.occupied_beds || 0)),
  }));

  // Derive complaints breakdown dynamically from recent complaints in DB
  const complaintsMap: Record<string, number> = {};
  (analytics?.recent_complaints || []).forEach((c) => {
    const cat = (c.category || "other").toLowerCase();
    complaintsMap[cat] = (complaintsMap[cat] || 0) + 1;
  });

  const complaintsCategoryData = Object.keys(complaintsMap).length > 0
    ? Object.entries(complaintsMap).map(([cat, count]) => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        count,
        color: CATEGORY_COLORS[cat] || "#64748B",
      }))
    : [
        { name: "Plumbing", count: 1, color: "#10B981" },
        { name: "WiFi", count: 1, color: "#3B82F6" },
      ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Property Management Console"
          subtitle="Real-time occupancy metrics, automated billing, and revenue analytics."
        />

        <Link
          href="/owner/properties/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {/* 4 Primary SaaS Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Properties */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Properties Managed</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">
              {analytics?.total_properties ?? properties.length}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Live listings across Bengaluru</p>
        </div>

        {/* 2. Residents */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Active Residents</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">
              {analytics?.total_residents ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Allocated
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Verified tenant leases</p>
        </div>

        {/* 3. Occupancy Rate */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Portfolio Occupancy</span>
            <Bed className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">
              {analytics?.occupancy_rate ?? 0}%
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              Optimal
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Beds filled vs capacity</p>
        </div>

        {/* 4. Monthly Revenue */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Monthly Bed Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(analytics?.monthly_revenue ?? 0)}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              MRR
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Billed monthly recurring rent</p>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Bed Distribution Chart across Owner Properties */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Property Bed Capacity & Occupancy</span>
              </h3>
              <p className="text-xs text-slate-400">Occupied vs Available beds by property</p>
            </div>
            <Link
              href="/owner/rooms"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Manage Beds</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full pt-4">
            {isMounted && propertyDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B101B",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#F8FAFC",
                    }}
                  />
                  <Bar dataKey="occupiedBeds" name="Occupied Beds" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="availableBeds" name="Available Beds" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading live property bed telemetry...
              </div>
            )}
          </div>
        </div>

        {/* Complaints Triage Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Ticket Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400">{analytics?.pending_complaints ?? 0} active tickets</p>
            </div>
            <Link
              href="/owner/complaints"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complaintsCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {complaintsCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B101B",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#F8FAFC",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
            {complaintsCategoryData.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                <span className="text-slate-400 flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <span className="font-bold text-white ml-2">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property Portfolio Quick Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Your Managed Properties</h3>
            <p className="text-xs text-slate-400">Direct operational control for rooms, floors, and rates</p>
          </div>
          <Link
            href="/owner/properties"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Full Portfolio Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-white/5">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Properties Onboarded Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              Create your first PG/Hostel property with building and floor blueprints.
            </p>
            <Link
              href="/owner/properties/new"
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => {
              const occRate = p.total_beds && p.total_beds > 0
                ? Math.round(((p.occupied_beds || 0) / p.total_beds) * 100)
                : 0;

              return (
                <div
                  key={p.id}
                  className="glass-card rounded-3xl border border-white/5 overflow-hidden hover:border-white/10 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-slate-800">
                    <img
                      src={
                        p.images?.[0] ||
                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
                      }
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                        {p.property_type}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <h4 className="text-base font-bold text-white truncate">{p.name}</h4>
                      <span className="text-xs font-bold text-emerald-400 shrink-0 ml-2">
                        {formatCurrency(p.starting_price || 8000)}/mo
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Beds</div>
                        <div className="text-sm font-extrabold text-white mt-0.5">{p.total_beds || 0}</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Occupied</div>
                        <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{p.occupied_beds || 0}</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Occupancy</div>
                        <div className="text-sm font-extrabold text-teal-400 mt-0.5">{occRate}%</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/owner/properties/${p.id}`}
                        className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold text-center border border-white/10 transition-colors"
                      >
                        Property Details
                      </Link>
                      <Link
                        href={`/owner/rooms?property_id=${p.id}`}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold text-center border border-emerald-500/20 transition-colors"
                      >
                        Beds & Floors
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
