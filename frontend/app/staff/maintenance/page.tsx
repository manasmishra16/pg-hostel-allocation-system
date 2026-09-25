"use client";

import React, { useState } from "react";
import Header from "@/components/dashboard/Header";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Flame,
  Droplets,
  Sparkles,
  Shield,
  Calendar,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  facility: string;
  category: "WATER" | "POWER" | "FIRE_SAFETY" | "SANITATION";
  frequency: string;
  lastDone: string;
  nextDue: string;
  status: "UP_TO_DATE" | "DUE_SOON" | "OVERDUE";
  technician: string;
}

export default function StaffMaintenancePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: "1",
      facility: "Overhead Water Tank Deep Scrub & Chlorination",
      category: "WATER",
      frequency: "Quarterly",
      lastDone: "10 Jun 2026",
      nextDue: "10 Sep 2026",
      status: "DUE_SOON",
      technician: "Ramu Shinde (Plumbing)",
    },
    {
      id: "2",
      facility: "Commercial RO Purifier Sediment & Carbon Filter Replacement",
      category: "WATER",
      frequency: "Bi-Monthly",
      lastDone: "15 Jul 2026",
      nextDue: "15 Sep 2026",
      status: "UP_TO_DATE",
      technician: "Aquaguard Services",
    },
    {
      id: "3",
      facility: "125 kVA Diesel Generator Load Test & Battery Check",
      category: "POWER",
      frequency: "Monthly",
      lastDone: "01 Aug 2026",
      nextDue: "01 Sep 2026",
      status: "UP_TO_DATE",
      technician: "Kirloskar Power Team",
    },
    {
      id: "4",
      facility: "CO2 & Dry Powder Fire Extinguisher Pressure Gauge Audit",
      category: "FIRE_SAFETY",
      frequency: "Quarterly",
      lastDone: "15 May 2026",
      nextDue: "15 Aug 2026",
      status: "OVERDUE",
      technician: "Anita Devi (Safety Officer)",
    },
    {
      id: "5",
      facility: "Common Area & Washroom High-Pressure Steam Sanitization",
      category: "SANITATION",
      frequency: "Weekly",
      lastDone: "10 Sep 2026",
      nextDue: "17 Sep 2026",
      status: "UP_TO_DATE",
      technician: "Housekeeping Crew A",
    },
  ]);

  const handleMarkDone = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "UP_TO_DATE",
              lastDone: new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            }
          : s
      )
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Preventive Facility Maintenance Schedule"
        subtitle="Mandatory periodic checks for water purification, backup generators, fire alarms, and sanitation."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Scheduled Audits</div>
            <div className="text-2xl font-black text-white mt-1">{schedules.length} Items</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Compliant Checks</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {schedules.filter((s) => s.status === "UP_TO_DATE").length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Immediate Action Due</div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              {schedules.filter((s) => s.status === "OVERDUE" || s.status === "DUE_SOON").length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Schedule Items Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Facility Audit Registry</h3>
          <p className="text-xs text-slate-400 mt-0.5">Statutory building maintenance cycles</p>
        </div>

        <div className="divide-y divide-white/5">
          {schedules.map((s) => (
            <div
              key={s.id}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.015] transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white">{s.facility}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-slate-400 uppercase">
                    {s.frequency}
                  </span>
                  {s.status === "OVERDUE" && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                      OVERDUE
                    </span>
                  )}
                  {s.status === "DUE_SOON" && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                      DUE SOON
                    </span>
                  )}
                  {s.status === "UP_TO_DATE" && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      COMPLIANT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Assigned: <strong className="text-slate-200">{s.technician}</strong></span>
                  <span>Last Completed: {s.lastDone}</span>
                  <span>Next Due: {s.nextDue}</span>
                </div>
              </div>

              <button
                onClick={() => handleMarkDone(s.id)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/20 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Inspected</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
