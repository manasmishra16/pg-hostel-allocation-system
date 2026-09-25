"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Allocation } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import {
  Users,
  Search,
  Calendar,
  Building2,
  CheckCircle2,
  Shield,
  Phone,
  Bed,
} from "lucide-react";

export default function StaffResidentsPage() {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAllocations();
  }, [user]);

  const loadAllocations = async () => {
    try {
      setIsLoading(true);
      const data = await api.allocations.getAll(undefined, "ACTIVE");
      setAllocations(data || []);
    } catch (err) {
      console.error("Failed to load resident roster:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = allocations.filter((a) => {
    const nameMatch = (a.tenant_name || "").toLowerCase().includes(search.toLowerCase());
    const roomMatch = (a.room_number || "").toLowerCase().includes(search.toLowerCase());
    return nameMatch || roomMatch;
  });

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Resident Room Directory"
        subtitle="Field directory of current occupants for housekeeping and room maintenance visits."
      />

      {/* Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resident name or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{filtered.length} Active Occupants</span>
      </div>

      {/* Roster Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border border-white/5">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Residents Found</h4>
          <p className="text-xs text-slate-400 mt-1">No resident records matched your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="glass-card p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                  {a.tenant_name ? a.tenant_name.charAt(0) : "R"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{a.tenant_name || "Resident"}</h4>
                  <p className="text-xs text-slate-400">ID #{a.tenant_id.slice(0, 8)}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Room & Bed:</span>
                  <span className="font-bold text-white">Room {a.room_number || "—"} ({a.bed_code})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Move-in Date:</span>
                  <span className="text-slate-300">
                    {a.check_in_date ? new Date(a.check_in_date).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                </span>
                <span>Assigned</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
