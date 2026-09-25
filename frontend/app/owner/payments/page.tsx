"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property } from "@/lib/api";
import { Invoice } from "@/types";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Download,
  Plus,
  Receipt,
  Building2,
  Calendar,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function OwnerPaymentsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");

  // Generate Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("September 2026");
  const [subtotal, setSubtotal] = useState(8500);
  const [electricity, setElectricity] = useState(450);
  const [maintenance, setMaintenance] = useState(300);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Receipt Modal
  const [receiptData, setReceiptData] = useState<any | null>(null);

  useEffect(() => {
    loadProperties();
  }, [user]);

  useEffect(() => {
    loadInvoices();
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

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await api.invoices.getAll(
        selectedPropertyId || undefined,
        statusFilter !== "ALL" ? statusFilter : undefined
      );
      setInvoices(data || []);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId.trim()) {
      alert("Please specify a tenant ID or resident.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.invoices.create({
        tenant_id: tenantId,
        property_id: selectedPropertyId || undefined,
        billing_period: billingPeriod,
        subtotal: Number(subtotal),
        electricity_charges: Number(electricity),
        maintenance_charges: Number(maintenance),
      });
      setShowInvoiceModal(false);
      setTenantId("");
      await loadInvoices();
    } catch (err) {
      console.error("Failed to create invoice:", err);
      alert("Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReceipt = async (invId: string) => {
    try {
      const rec = await api.invoices.getReceipt(invId);
      setReceiptData(rec);
    } catch (err) {
      console.error("Failed to get receipt:", err);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const invNoMatch = (inv.invoice_number || "").toLowerCase().includes(search.toLowerCase());
    const periodMatch = (inv.billing_period || "").toLowerCase().includes(search.toLowerCase());
    return invNoMatch || periodMatch;
  });

  const totalCollected = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, i) => acc + (i.total_amount || 0), 0);

  const totalPending = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((acc, i) => acc + (i.total_amount || 0), 0);

  const collectionRate =
    totalCollected + totalPending > 0
      ? Math.round((totalCollected / (totalCollected + totalPending)) * 100)
      : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Revenue & Financial Invoices"
          subtitle="Real-time rent collections, payment reconciliation, and GST-compliant invoicing."
        />

        <div className="flex items-center gap-3">
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

          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Rent Collected</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(totalCollected)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Outstanding Dues</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{formatCurrency(totalPending)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Collection Rate</div>
            <div className="text-2xl font-black text-white mt-1">{collectionRate}%</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number or billing cycle..."
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
              {s === "ALL" ? "All Invoices" : s === "PAID" ? "Settled (Paid)" : "Unsettled (Pending)"}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">Invoice Records</h3>
          <p className="text-xs text-slate-400 mt-0.5">Automated billing history synced with Razorpay escrow</p>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Invoices Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              No bills match your criteria. Generate a new invoice for residents to initiate collection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white/[0.01]">
                  <th className="py-4 px-6">Invoice #</th>
                  <th className="py-4 px-6">Billing Cycle</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white font-mono">{inv.invoice_number}</div>
                      <div className="text-[11px] text-slate-500">Tenant ID: {inv.tenant_id.slice(0, 8)}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-200">
                      {inv.billing_period}
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(inv.due_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-white">
                        {formatCurrency(inv.total_amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {inv.status === "PAID" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewReceipt(inv.id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                        title="View Official Receipt"
                      >
                        <Receipt className="w-4 h-4 text-emerald-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Generate Resident Invoice</h3>
                <p className="text-xs text-slate-400 mt-0.5">Bill monthly rent and utilities</p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Tenant User ID</label>
                <input
                  type="text"
                  required
                  placeholder="Enter tenant UUID from resident roster"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Billing Period</label>
                <input
                  type="text"
                  required
                  value={billingPeriod}
                  onChange={(e) => setBillingPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={subtotal}
                    onChange={(e) => setSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Power (₹)</label>
                  <input
                    type="number"
                    value={electricity}
                    onChange={(e) => setElectricity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Maint. (₹)</label>
                  <input
                    type="number"
                    value={maintenance}
                    onChange={(e) => setMaintenance(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>Total Invoice Value:</span>
                <span className="text-emerald-400 font-extrabold text-sm">
                  {formatCurrency(Number(subtotal) + Number(electricity) + Number(maintenance))}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">StayNest Official Receipt</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{receiptData.invoice_number}</h3>
              </div>
              <button
                onClick={() => setReceiptData(null)}
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-slate-500">Billing Period</span>
                  <div className="font-semibold text-white mt-0.5">{receiptData.billing_period}</div>
                </div>
                <div>
                  <span className="text-slate-500">Status</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{receiptData.status}</div>
                </div>
                <div>
                  <span className="text-slate-500">Due Date</span>
                  <div className="font-semibold text-slate-300 mt-0.5">{new Date(receiptData.due_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-slate-500">Total Billed</span>
                  <div className="font-black text-white text-sm mt-0.5">{formatCurrency(receiptData.total_amount)}</div>
                </div>
              </div>

              {receiptData.items && receiptData.items.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold text-slate-400">Line Items</div>
                  <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden">
                    {receiptData.items.map((item: any, i: number) => (
                      <div key={i} className="p-3 flex items-center justify-between">
                        <span className="text-slate-300">{item.description}</span>
                        <span className="font-bold text-white">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setReceiptData(null)}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
