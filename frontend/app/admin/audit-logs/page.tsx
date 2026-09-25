"use client";

import React, { useState } from "react";
import Header from "@/components/dashboard/Header";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  Lock,
  FileCheck,
  User,
  Key,
  Shield,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "INFO";
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");

  const [logs] = useState<AuditLogEntry[]>([
    {
      id: "log-1",
      timestamp: "14 Sep 2026, 18:45:12 UTC",
      actor: "owner@staynest.internal",
      action: "BED_STATUS_UPDATE",
      resource: "Bed Bed A (Room 101) -> OCCUPIED",
      ipAddress: "103.21.244.12",
      status: "SUCCESS",
    },
    {
      id: "log-2",
      timestamp: "14 Sep 2026, 18:32:05 UTC",
      actor: "warden@staynest.internal",
      action: "ALLOCATION_CREATED",
      resource: "Tenant Manas Mishra -> Bed 101-A",
      ipAddress: "103.21.244.18",
      status: "SUCCESS",
    },
    {
      id: "log-3",
      timestamp: "14 Sep 2026, 17:15:40 UTC",
      actor: "staff@staynest.internal",
      action: "COMPLAINT_RESOLVED",
      resource: "Ticket #c84920b1 (Plumbing Repair)",
      ipAddress: "49.37.112.4",
      status: "SUCCESS",
    },
    {
      id: "log-4",
      timestamp: "14 Sep 2026, 16:20:10 UTC",
      actor: "tenant@staynest.internal",
      action: "DOCUMENT_UPLOAD",
      resource: "National ID Proof (Encrypted AES-256)",
      ipAddress: "157.49.201.88",
      status: "SUCCESS",
    },
    {
      id: "log-5",
      timestamp: "14 Sep 2026, 15:10:00 UTC",
      actor: "System Scheduler",
      action: "ESCALATION_CHECK",
      resource: "Auto-escalated Ticket #9f82d1 (SLA > 24h)",
      ipAddress: "127.0.0.1",
      status: "WARNING",
    },
    {
      id: "log-6",
      timestamp: "14 Sep 2026, 14:02:18 UTC",
      actor: "Razorpay Webhook",
      action: "PAYMENT_CAPTURED",
      resource: "Invoice #INV-2026-09-001 (₹8,950)",
      ipAddress: "52.66.101.44",
      status: "SUCCESS",
    },
  ]);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Security & Regulatory Audit Trail"
        subtitle="Immutable event logs documenting bed transitions, financial settlements, KYC uploads, and staff dispatches."
      />

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit action, actor, or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{filtered.length} Logged Events</span>
      </div>

      {/* Logs Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Event Journal</h3>
            <p className="text-xs text-slate-400 mt-0.5">Cryptographically signed system events</p>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Tamper-Evident
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white/[0.01]">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Actor</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Resource Affected</th>
                <th className="py-4 px-6">Origin IP</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.015] transition-colors font-mono">
                  <td className="py-4 px-6 text-slate-400 text-[11px] font-sans">
                    {l.timestamp}
                  </td>
                  <td className="py-4 px-6 font-semibold text-white font-sans">
                    {l.actor}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-emerald-400 border border-white/10">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-sans text-slate-200">
                    {l.resource}
                  </td>
                  <td className="py-4 px-6 text-slate-500 text-[11px]">
                    {l.ipAddress}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {l.status === "SUCCESS" ? (
                      <span className="text-emerald-400 font-bold text-[10px] uppercase font-sans">
                        SUCCESS
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold text-[10px] uppercase font-sans">
                        WARN
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
