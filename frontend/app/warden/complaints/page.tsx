"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Complaint } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  ShieldAlert,
  Calendar,
  Send,
} from "lucide-react";

export default function WardenComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "IN_PROGRESS" | "RESOLVED">("ALL");

  useEffect(() => {
    loadComplaints();
  }, [user, statusFilter]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const data = await api.complaints.getAll(
        statusFilter !== "ALL" ? statusFilter : undefined
      );
      setComplaints(data || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.complaints.resolve(id, "Inspected and resolved by Warden");
      await loadComplaints();
    } catch (err) {
      console.error("Failed to resolve:", err);
    }
  };

  const handleEscalate = async (id: string) => {
    try {
      await api.complaints.escalate(id, "Escalated by Warden to Property Owner");
      await loadComplaints();
    } catch (err) {
      console.error("Failed to escalate:", err);
    }
  };

  const filtered = complaints.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      (c.category || "").toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Hostel Incident & Maintenance Center"
        subtitle="Review student complaints, triage plumbing/wifi/electrical issues, and enforce facility SLAs."
      />

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, rooms, or descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {(["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === s
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {s === "ALL"
                ? "All Tickets"
                : s === "PENDING"
                ? "Unassigned"
                : s === "IN_PROGRESS"
                ? "In Progress"
                : "Resolved"}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Incident Queue</h3>
          <p className="text-xs text-slate-400 mt-0.5">Live resident ticket log with automated AI triage</p>
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
            <h4 className="text-base font-bold text-white">No Tickets in Queue</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              All reported complaints have been triaged and resolved.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-white/[0.015] transition-colors"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 uppercase">
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
                    {c.escalated && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Escalated
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {c.description}
                  </p>

                  {c.ai_summary && (
                    <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>
                        <strong>AI Triage:</strong> {c.ai_summary} (Dept: {c.suggested_department})
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Resident: {c.tenant_name || "Hostel Resident"}</span>
                    {c.room_number && <span>Room #{c.room_number}</span>}
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === "RESOLVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : c.status === "IN_PROGRESS"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {c.status.replace(/_/g, " ")}
                  </span>

                  <div className="flex items-center gap-2">
                    {!c.escalated && c.status !== "RESOLVED" && (
                      <button
                        onClick={() => handleEscalate(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 text-xs font-semibold transition-colors"
                        title="Escalate to Management"
                      >
                        Escalate
                      </button>
                    )}

                    {c.status !== "RESOLVED" && (
                      <button
                        onClick={() => handleResolve(c.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
                      >
                        Mark Fixed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
