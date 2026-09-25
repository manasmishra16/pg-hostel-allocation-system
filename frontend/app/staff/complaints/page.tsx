"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Complaint } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import {
  Wrench,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

export default function StaffComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const data = await api.complaints.getAll();
      setComplaints(data || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.complaints.resolve(id, "Repair inspected and completed on-site by Staff");
      await loadComplaints();
    } catch (err) {
      console.error("Failed to resolve:", err);
    }
  };

  const handleStartWork = async (id: string) => {
    try {
      await api.complaints.update(id, { status: "IN_PROGRESS" });
      await loadComplaints();
    } catch (err) {
      console.error("Failed to start work:", err);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "ALL" ||
      (c.category || "").toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Field Maintenance Ticket Queue"
        subtitle="Operational triage queue for plumbing, electrical, carpentry, and housekeeping tickets."
      />

      {/* Search & Category Filter */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defects or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "Plumbing", "Electrical", "WiFi", "Cleanliness"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Assigned Repair Tickets</h3>
          <p className="text-xs text-slate-400 mt-0.5">Live work tickets categorized by trade</p>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Tickets Found</h4>
            <p className="text-xs text-slate-400 mt-1">All tickets in this category have been resolved.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-slate-300 uppercase">
                      {c.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        c.priority === "CRITICAL" || c.priority === "HIGH"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 max-w-2xl">{c.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>Room #{c.room_number || "—"}</span>
                    <span>Reported: {new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.status !== "RESOLVED" && c.status !== "IN_PROGRESS" && (
                    <button
                      onClick={() => handleStartWork(c.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
                    >
                      Start Work
                    </button>
                  )}
                  {c.status !== "RESOLVED" && (
                    <button
                      onClick={() => handleResolve(c.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
                    >
                      Mark Done
                    </button>
                  )}
                  {c.status === "RESOLVED" && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fixed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
