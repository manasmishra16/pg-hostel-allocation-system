"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property, Bed, Allocation } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  IndianRupee,
  UserX,
  Bed as BedIcon,
  Building2,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function WardenAllocationsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllocateModal, setShowAllocateModal] = useState(false);

  // Form State
  const [selectedBedId, setSelectedBedId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [monthlyRent, setMonthlyRent] = useState(8000);
  const [depositAmount, setDepositAmount] = useState(15000);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    loadAllocations();
    loadAvailableBeds();
  }, [selectedPropertyId]);

  const loadData = async () => {
    try {
      const props = await api.getProperties();
      setProperties(props || []);
      if (props && props.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(props[0].id);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const loadAllocations = async () => {
    try {
      setIsLoading(true);
      const data = await api.allocations.getAll(selectedPropertyId || undefined);
      setAllocations(data || []);
    } catch (err) {
      console.error("Failed to load allocations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableBeds = async () => {
    try {
      const beds = await api.rooms.getBeds(undefined, "AVAILABLE");
      setAvailableBeds(beds || []);
      if (beds && beds.length > 0) {
        setSelectedBedId(beds[0].id);
        setMonthlyRent(beds[0].monthly_rent || 8000);
      }
    } catch (err) {
      console.error("Failed to load available beds:", err);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId || !tenantId.trim()) {
      alert("Please select a bed and specify the tenant ID.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.allocations.create({
        bed_id: selectedBedId,
        tenant_id: tenantId,
        monthly_rent: Number(monthlyRent),
        deposit_amount: Number(depositAmount),
        notes,
      });

      setShowAllocateModal(false);
      setTenantId("");
      setNotes("");
      await Promise.all([loadAllocations(), loadAvailableBeds()]);
    } catch (err) {
      console.error("Failed to allocate bed:", err);
      alert("Allocation failed. Ensure bed is available and tenant exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVacate = async (id: string, name?: string | null) => {
    if (!window.confirm(`Vacate bed and complete checkout for ${name || "this resident"}?`)) return;
    try {
      await api.allocations.release(id);
      await Promise.all([loadAllocations(), loadAvailableBeds()]);
    } catch (err) {
      console.error("Failed to release bed:", err);
    }
  };

  const activeAllocations = allocations.filter((a) => a.status === "ACTIVE");

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Bed Allocation & Resident Check-in"
          subtitle="Assign available beds to verified residents and execute formal move-ins/checkouts."
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAllocateModal(true)}
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate New Bed</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Active Allocations</div>
            <div className="text-2xl font-black text-white mt-1">{activeAllocations.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Available Beds to Assign</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{availableBeds.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <BedIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Security Deposit Custody</div>
            <div className="text-2xl font-black text-teal-400 mt-1">Escrow Secured</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-base font-bold text-white">All Bed Allocations</h3>
          <p className="text-xs text-slate-400 mt-0.5">Direct bed assignment ledger</p>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : allocations.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Allocations Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              There are no bed allocations recorded. Click below to assign a resident to an available bed.
            </p>
            <button
              onClick={() => setShowAllocateModal(true)}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Allocate Bed
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-white/[0.01]">
                  <th className="py-4 px-6">Resident</th>
                  <th className="py-4 px-6">Assigned Bed</th>
                  <th className="py-4 px-6">Check-in Date</th>
                  <th className="py-4 px-6">Monthly Rent</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {allocations.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{a.tenant_name || "Resident"}</div>
                      <div className="text-[11px] text-slate-500">ID #{a.tenant_id.slice(0, 8)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">Room {a.room_number || "—"}</div>
                      <div className="text-[11px] text-emerald-400">{a.bed_code || "Bed"}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {a.check_in_date ? new Date(a.check_in_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-400">
                      {formatCurrency(a.monthly_rent || 8000)}/mo
                    </td>
                    <td className="py-4 px-6">
                      {a.status === "ACTIVE" ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active Stay
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/5 text-slate-400 border border-white/10">
                          {a.status}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {a.status === "ACTIVE" && (
                        <button
                          onClick={() => handleVacate(a.id, a.tenant_name)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
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

      {/* Allocate Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Allocate Bed</h3>
                <p className="text-xs text-slate-400 mt-0.5">Assign tenant to an available hostel bed</p>
              </div>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Available Bed</label>
                {availableBeds.length === 0 ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                    No beds currently available. Mark beds as available in Bed Map first.
                  </div>
                ) : (
                  <select
                    value={selectedBedId}
                    onChange={(e) => {
                      setSelectedBedId(e.target.value);
                      const b = availableBeds.find((x) => x.id === e.target.value);
                      if (b) setMonthlyRent(b.monthly_rent || 8000);
                    }}
                    className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {availableBeds.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#0B101B]">
                        {b.bed_code} — {formatCurrency(b.monthly_rent)}/mo
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Tenant User ID</label>
                <input
                  type="text"
                  required
                  placeholder="Enter tenant UUID"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Admission Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified student ID, semester 1 enrollment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || availableBeds.length === 0}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Allocating..." : "Complete Move-In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
