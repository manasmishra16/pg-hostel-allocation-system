"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property, DashboardStats } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  BarChart3,
  Bed,
  Building2,
  IndianRupee,
  Users,
  Layers,
  ArrowUpRight,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function OwnerAnalyticsPage() {
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
      console.error("Failed to load owner analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Occupancy per property
  const propertyOccupancyData = properties.map((p) => {
    const total = p.total_beds || 0;
    const occ = p.occupied_beds || 0;
    const rate = total > 0 ? Math.round((occ / total) * 100) : 0;
    return {
      name: p.name.length > 14 ? `${p.name.slice(0, 12)}...` : p.name,
      occupancyRate: rate,
      totalBeds: total,
      occupiedBeds: occ,
      monthlyYield: occ * (p.starting_price || 8000),
    };
  });

  const totalPortfolioBeds = properties.reduce((acc, p) => acc + (p.total_beds || 0), 0);
  const totalOccupiedBeds = properties.reduce((acc, p) => acc + (p.occupied_beds || 0), 0);
  const avgOccupancy = totalPortfolioBeds > 0 ? Math.round((totalOccupiedBeds / totalPortfolioBeds) * 100) : 0;
  const totalRevenue = analytics?.monthly_revenue ?? 0;
  const arpu = totalOccupiedBeds > 0 ? Math.round(totalRevenue / totalOccupiedBeds) : 0;

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Portfolio Analytics & Yield Telemetry"
        subtitle="Mathematical occupancy rates, average revenue per occupied bed (RevPAB), and capacity metrics."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Portfolio Capacity</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalPortfolioBeds} Beds</div>
          <p className="text-[11px] text-slate-500">{properties.length} Active properties</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Aggregate Occupancy</span>
            <Bed className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-400">{avgOccupancy}%</div>
          <p className="text-[11px] text-slate-500">{totalOccupiedBeds} Active resident stays</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Monthly Bed Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{formatCurrency(totalRevenue)}</div>
          <p className="text-[11px] text-slate-500">Contracted monthly rent</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">RevPAB (Avg / Bed)</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">{formatCurrency(arpu)}</div>
          <p className="text-[11px] text-slate-500">Revenue per occupied bed</p>
        </div>
      </div>

      {/* Property Occupancy Performance Chart */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Property Occupancy Performance (%)</span>
          </h3>
          <p className="text-xs text-slate-400">Real-time bed utilization across managed properties</p>
        </div>

        <div className="h-72 w-full pt-4">
          {isMounted && propertyOccupancyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyOccupancyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B101B",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any) => [`${val}%`, "Occupancy Rate"]}
                />
                <Bar dataKey="occupancyRate" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading property occupancy analytics...
            </div>
          )}
        </div>
      </div>

      {/* Property Yield Breakdown Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Property Yield & Capacity Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">Direct breakdown of bed inventory and monthly revenue</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white/[0.01]">
                <th className="py-4 px-6">Property Name</th>
                <th className="py-4 px-6">Total Beds</th>
                <th className="py-4 px-6">Occupied</th>
                <th className="py-4 px-6">Vacant</th>
                <th className="py-4 px-6">Occupancy</th>
                <th className="py-4 px-6 text-right">Estimated Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {properties.map((p) => {
                const tot = p.total_beds || 0;
                const occ = p.occupied_beds || 0;
                const vac = Math.max(0, tot - occ);
                const rate = tot > 0 ? Math.round((occ / tot) * 100) : 0;
                const yieldAmt = occ * (p.starting_price || 8000);

                return (
                  <tr key={p.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{p.name}</td>
                    <td className="py-4 px-6 font-semibold">{tot}</td>
                    <td className="py-4 px-6 text-emerald-400 font-bold">{occ}</td>
                    <td className="py-4 px-6 text-blue-400 font-semibold">{vac}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-white">{rate}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-emerald-400">
                      {formatCurrency(yieldAmt)}/mo
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
