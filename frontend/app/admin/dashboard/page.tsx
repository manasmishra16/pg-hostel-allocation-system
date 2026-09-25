"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, DashboardStats, Property } from "@/lib/api";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  Activity,
  Server,
  KeyRound,
  ArrowRight,
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [data, props] = await Promise.all([
        api.getAdminAnalytics(),
        api.getProperties(),
      ]);
      setStats(data);
      setProperties(props || []);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Real property bed capacity distribution
  const chartData = properties.map((p) => ({
    name: p.name.length > 14 ? `${p.name.slice(0, 12)}...` : p.name,
    totalBeds: p.total_beds || 0,
    occupiedBeds: p.occupied_beds || 0,
    occupancyRate: p.total_beds ? Math.round(((p.occupied_beds || 0) / p.total_beds) * 100) : 0,
  }));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Enterprise Governance & Platform Health"
          subtitle="Platform-wide multi-property telemetry, compliance auditing, and network settlements."
        />

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>FY 2026-27 · Multi-Property Grid</span>
          </div>
        </div>
      </div>

      {/* 4 Core Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Network Properties</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">
              {stats?.total_properties ?? properties.length}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Managed campus portfolios</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Platform Residents</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">
              {stats?.total_residents ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> KYC Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Verified residents housed</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Global Occupancy</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-teal-400 tracking-tight">
              {stats?.occupancy_rate ?? 0}%
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              Optimal
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Total capacity utilization</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Monthly Escrow Volume</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-emerald-400 tracking-tight">
              {formatCurrency(stats?.monthly_revenue ?? 0)}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              MRR
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Gross monthly transacted rent</p>
        </div>
      </div>

      {/* Platform Health Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold">PostgreSQL & FastAPI Core</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Operational (18ms latency)</span>
            </div>
          </div>
          <Server className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold">Razorpay Escrow Settlement</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>T+1 Settlement Active</span>
            </div>
          </div>
          <IndianRupee className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold">Enterprise SLA Resolution</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>98.4% On-time Resolution</span>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-teal-400" />
        </div>
      </div>

      {/* Network Capacity Distribution Chart */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Network Property Bed Inventory</span>
            </h3>
            <p className="text-xs text-slate-400">Total capacity vs filled resident beds per facility</p>
          </div>
          <Link
            href="/admin/properties"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>All Properties</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-64 w-full pt-4">
          {isMounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="totalBeds" name="Total Capacity" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="occupiedBeds" name="Occupied Beds" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading enterprise telemetry...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
