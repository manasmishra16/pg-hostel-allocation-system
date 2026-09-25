"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Invoice } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  IndianRupee,
  Search,
  Building2,
  Calendar,
  Receipt,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  useEffect(() => {
    loadInvoices();
  }, [user, statusFilter]);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await api.invoices.getAll(
        undefined,
        statusFilter !== "ALL" ? statusFilter : undefined
      );
      setInvoices(data || []);
    } catch (err) {
      console.error("Failed to load platform invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = invoices.filter((inv) => {
    const invMatch = (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase());
    const periodMatch = (inv.billing_period || "").toLowerCase().includes(search.toLowerCase());
    return invMatch || periodMatch;
  });

  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + (i.total_amount || 0), 0);
  const totalPending = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((acc, i) => acc + (i.total_amount || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Platform Escrow & Settlements"
        subtitle="Global transaction ledger, rental fee disbursements, and gateway transaction reconciliation."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Settled Rent</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Pending Unsettled Escrow</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{formatCurrency(totalPending)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Razorpay Settlement Gateway</div>
            <div className="text-2xl font-black text-white mt-1">100% Uptime</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["ALL", "PAID", "PENDING"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {s === "ALL" ? "All Platform Invoices" : s === "PAID" ? "Settled" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Platform Invoice Master Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">Encrypted transaction settlements across all properties</p>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Invoices Found</h4>
            <p className="text-xs text-slate-400 mt-1">No transaction records match your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white/[0.01]">
                  <th className="py-4 px-6">Invoice Number</th>
                  <th className="py-4 px-6">Tenant ID</th>
                  <th className="py-4 px-6">Billing Cycle</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6 text-right">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6 font-bold text-white font-mono">{inv.invoice_number}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                      {inv.tenant_id.slice(0, 10)}...
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">{inv.billing_period}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-400">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {inv.status === "PAID" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Settled
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Unsettled
                        </span>
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
