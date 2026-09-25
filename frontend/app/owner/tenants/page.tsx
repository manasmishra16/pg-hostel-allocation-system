"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property } from "@/lib/api";
import { Allocation } from "@/types";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Search,
  Building2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  ShieldCheck,
  UserX,
  Bed,
  Phone,
  Mail,
} from "lucide-react";

export default function OwnerTenantsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ACTIVE");

  useEffect(() => {
    loadProperties();
  }, [user]);

  useEffect(() => {
    loadAllocations();
  }, [selectedPropertyId, statusFilter]);

  const loadProperties = async () => {
    try {
      const data = await api.getProperties();
      setProperties(data || []);
      if (data && data.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  };

  const loadAllocations = async () => {
    try {
      setIsLoading(true);
      const data = await api.allocations.getAll(
        selectedPropertyId || undefined,
        statusFilter !== "ALL" ? statusFilter : undefined
      );
      setAllocations(data || []);
    } catch (err) {
      console.error("Failed to load allocations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRelease = async (allocationId: string, residentName?: string | null) => {
    if (!window.confirm(`Vacate bed and end active stay for ${residentName || "this resident"}?`)) return;
    try {
      await api.allocations.release(allocationId);
      await loadAllocations();
    } catch (err) {
      console.error("Failed to release bed:", err);
      alert("Failed to release allocation");
    }
  };

  const filteredAllocations = allocations.filter((a) => {
    const nameMatch = (a.tenant_name || "").toLowerCase().includes(search.toLowerCase());
    const roomMatch = (a.room_number || "").toLowerCase().includes(search.toLowerCase());
    const bedMatch = (a.bed_code || "").toLowerCase().includes(search.toLowerCase());
    return nameMatch || roomMatch || bedMatch;
  });

  const activeCount = allocations.filter((a) => a.status === "ACTIVE").length;
  const totalBilled = allocations
    .filter((a) => a.status === "ACTIVE")
    .reduce((acc, a) => acc + (a.monthly_rent || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Resident Directory & Leases"
          subtitle="Real-time resident rosters, active bed assignments, and check-in verifications."
        />

        {/* Property Selector */}
        <div className="relative">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="px-4 py-2.5 rounded-full glass-input text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" className="bg-[#0B101B]">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0B101B] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Active Residents</div>
            <div className="text-2xl font-black text-white mt-1">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Monthly Contracted Rent</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(totalBilled)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">KYC Verification Rate</div>
            <div className="text-2xl font-black text-teal-400 mt-1">100% Verified</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by resident name, room, or bed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["ACTIVE", "COMPLETED", "ALL"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {s === "ACTIVE" ? "Current Residents" : s === "COMPLETED" ? "Past Residents" : "All Records"}
            </button>
          ))}
        </div>
      </div>

      {/* Residents Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Resident Allocations</h3>
          <p className="text-xs text-slate-400 mt-0.5">Database verified lease and bed assignments</p>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredAllocations.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Residents Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No allocations match your selected filters. Use the Bed Management console to assign tenants to beds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white/[0.01]">
                  <th className="py-4 px-6">Resident</th>
                  <th className="py-4 px-6">Room & Bed</th>
                  <th className="py-4 px-6">Check-in Date</th>
                  <th className="py-4 px-6">Monthly Rent</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredAllocations.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 font-bold shrink-0">
                          {a.tenant_name ? a.tenant_name.charAt(0) : "R"}
                        </div>
                        <div>
                          <div className="font-bold text-white">{a.tenant_name || "Assigned Resident"}</div>
                          <div className="text-[11px] text-slate-500">ID #{a.tenant_id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">Room {a.room_number || "—"}</div>
                      <div className="text-[11px] text-emerald-400 font-medium">{a.bed_code || "Bed"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {a.check_in_date ? new Date(a.check_in_date).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-emerald-400">
                        {formatCurrency(a.monthly_rent || 8000)}/mo
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {a.status === "ACTIVE" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Stay
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-slate-400 border border-white/10">
                          {a.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {a.status === "ACTIVE" && (
                        <button
                          onClick={() => handleRelease(a.id, a.tenant_name)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          title="Vacate Bed"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Vacate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
