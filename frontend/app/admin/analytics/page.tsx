"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, DashboardStats, Property } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  IndianRupee,
  Layers,
  Bed,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
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
      const [adminStats, props] = await Promise.all([
        api.getAdminAnalytics(),
        api.getProperties(),
      ]);
      setStats(adminStats);
      setProperties(props || []);
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const propertyData = properties.map((p) => ({
    name: p.name.length > 14 ? `${p.name.slice(0, 12)}...` : p.name,
    capacity: p.total_beds || 0,
    occupied: p.occupied_beds || 0,
  }));

  const totalBeds = properties.reduce((acc, p) => acc + (p.total_beds || 0), 0);
  const totalOccupied = properties.reduce((acc, p) => acc + (p.occupied_beds || 0), 0);
  const grossRev = stats?.monthly_revenue ?? 0;

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Enterprise Telemetry & Network Analytics"
        subtitle="Global platform capacity metrics, settlement volume, and city-wide occupancy distributions."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Platform Bed Grid</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalBeds} Beds</div>
          <p className="text-[11px] text-slate-500">Across {properties.length} campuses</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Network Occupancy</span>
            <Bed className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-400">{stats?.occupancy_rate ?? 0}%</div>
          <p className="text-[11px] text-slate-500">{totalOccupied} Active residents</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Gross Transacted MRR</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{formatCurrency(grossRev)}</div>
          <p className="text-[11px] text-slate-500">Monthly gross billing</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Platform Health</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">99.98%</div>
          <p className="text-[11px] text-slate-500">FastAPI microservice uptime</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Capacity Utilization by Campus</span>
          </h3>
          <p className="text-xs text-slate-400">Total capacity vs currently occupied beds per property</p>
        </div>

        <div className="h-72 w-full pt-4">
          {isMounted && propertyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="capacity" name="Total Capacity" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="occupied" name="Occupied Beds" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading enterprise analytics...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
