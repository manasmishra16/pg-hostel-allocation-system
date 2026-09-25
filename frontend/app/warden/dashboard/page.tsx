"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property, Complaint, Notice, Allocation } from "@/lib/api";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import {
  Shield,
  Users,
  Bed,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Wrench,
  Bell,
  CalendarCheck,
  Building2,
  Phone,
} from "lucide-react";

export default function WardenDashboardPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWardenData();
  }, [user]);

  const loadWardenData = async () => {
    try {
      setIsLoading(true);
      const [props, allocs, comps, nots] = await Promise.all([
        api.getProperties(),
        api.allocations.getAll(),
        api.complaints.getAll(),
        api.notices.getAll(),
      ]);
      setProperties(props || []);
      setAllocations(allocs || []);
      setComplaints(comps || []);
      setNotices(nots || []);
    } catch (err) {
      console.error("Failed to load warden dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeResidents = allocations.filter((a) => a.status === "ACTIVE").length;
  const pendingComplaints = complaints.filter(
    (c) => c.status === "PENDING" || c.status === "ASSIGNED" || c.status === "IN_PROGRESS"
  );
  const totalBeds = properties.reduce((acc, p) => acc + (p.total_beds || 0), 0);
  const occupiedBeds = properties.reduce((acc, p) => acc + (p.occupied_beds || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Hostel Warden Operations Desk"
          subtitle="Resident welfare, discipline administration, check-ins, and facility maintenance dispatch."
        />

        <div className="flex items-center gap-2">
          <Link
            href="/warden/allocations"
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>New Check-in</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Hostel Residents</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{activeResidents}</div>
          <p className="text-[11px] text-slate-500">Registered on campus</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Hostel Occupancy</span>
            <Bed className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-400">{occupancyRate}%</div>
          <p className="text-[11px] text-slate-500">{occupiedBeds}/{totalBeds} Beds occupied</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Pending Issues</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{pendingComplaints.length}</div>
          <p className="text-[11px] text-slate-500">Require triage / dispatch</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold">Active Notices</span>
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400">{notices.length}</div>
          <p className="text-[11px] text-slate-500">Curfew & mess updates</p>
        </div>
      </div>

      {/* Main Grid: Urgent Issues + Recent Resident Check-ins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Maintenance & Complaints */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Urgent Resident Issues</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tickets awaiting warden review or staff assignment</p>
            </div>
            <Link
              href="/warden/complaints"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingComplaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No pending incident tickets. All rooms functioning normally.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingComplaints.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{c.title}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-slate-300 uppercase">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate max-w-sm">
                      {c.description}
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-3">
                      <span>Room #{c.room_number || "—"}</span>
                      <span>By {c.tenant_name || "Resident"}</span>
                    </div>
                  </div>

                  <Link
                    href="/warden/complaints"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold shrink-0 border border-emerald-500/20 transition-colors"
                  >
                    Triage
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Resident Allocations */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-400" />
                <span>Recent Resident Check-ins</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Active bed occupants and check-in dates</p>
            </div>
            <Link
              href="/warden/residents"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {allocations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No resident allocations recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {allocations.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                      {a.tenant_name?.charAt(0) || "R"}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{a.tenant_name || "Resident"}</div>
                      <div className="text-[11px] text-slate-400">
                        Room {a.room_number || "—"} ({a.bed_code || "Bed"})
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    Checked In
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
