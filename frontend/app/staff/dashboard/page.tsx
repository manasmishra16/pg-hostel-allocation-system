"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Complaint, Room, Notice } from "@/lib/api";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  Bed,
} from "lucide-react";

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, [user]);

  const loadStaffData = async () => {
    try {
      setIsLoading(true);
      const [comps, rms, nots] = await Promise.all([
        api.complaints.getAll(),
        api.rooms.getRooms(),
        api.notices.getAll(),
      ]);
      setComplaints(comps || []);
      setRooms(rms || []);
      setNotices(nots || []);
    } catch (err) {
      console.error("Failed to load staff data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTicket = async (id: string, newStatus: string) => {
    try {
      if (newStatus === "RESOLVED") {
        await api.complaints.resolve(id, "Field repairs completed and verified by Staff");
      } else {
        await api.complaints.update(id, { status: newStatus });
      }
      await loadStaffData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const pendingTickets = complaints.filter(
    (c) => c.status === "PENDING" || c.status === "ASSIGNED" || c.status === "IN_PROGRESS"
  );
  const resolvedTickets = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED");
  const criticalTickets = complaints.filter(
    (c) => (c.priority === "CRITICAL" || c.priority === "HIGH") && c.status !== "RESOLVED"
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Facility Maintenance & Work Orders"
          subtitle="On-site repairs, plumbing/electrical dispatch, sanitation rounds, and asset maintenance."
        />

        <Link
          href="/staff/maintenance"
          className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
        >
          <Wrench className="w-4 h-4" />
          <span>Maintenance Center</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Active Work Orders</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{pendingTickets.length}</div>
          <p className="text-[11px] text-slate-500">Awaiting fix / in progress</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Urgent Defects</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">{criticalTickets.length}</div>
          <p className="text-[11px] text-slate-500">High priority SLA tickets</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Completed Fixes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{resolvedTickets.length}</div>
          <p className="text-[11px] text-slate-500">Resolved and verified</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Supervised Rooms</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-white">{rooms.length}</div>
          <p className="text-[11px] text-slate-500">Under facility care</p>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Maintenance Work Order Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live work tickets requiring field actions</p>
          </div>
          <Link
            href="/staff/complaints"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : pendingTickets.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">All Maintenance Orders Completed</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No active defects reported across water, power, or sanitary infrastructure.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {pendingTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{ticket.title}</h4>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-300 uppercase">
                      {ticket.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        ticket.priority === "CRITICAL" || ticket.priority === "HIGH"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 max-w-2xl">{ticket.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>Room #{ticket.room_number || "—"}</span>
                    <span>Reported by: {ticket.tenant_name || "Resident"}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ticket.status !== "IN_PROGRESS" && (
                    <button
                      onClick={() => handleUpdateTicket(ticket.id, "IN_PROGRESS")}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-semibold transition-colors"
                    >
                      Start Repair
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateTicket(ticket.id, "RESOLVED")}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-colors"
                  >
                    Resolve Fix
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
