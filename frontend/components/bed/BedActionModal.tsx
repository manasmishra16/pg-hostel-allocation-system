"use client";

import React, { useState } from "react";
import { Bed, BedStatus } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { BedStatusBadge } from "./BedStatusBadge";
import { api } from "@/lib/api";
import { BedDouble, UserPlus, UserMinus, Wrench, Shield, CheckCircle2 } from "lucide-react";

export interface BedActionModalProps {
  bed: Bed | null;
  roomNumber?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BedActionModal: React.FC<BedActionModalProps> = ({
  bed,
  roomNumber,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [actionType, setActionType] = useState<"STATUS" | "ALLOCATE">("STATUS");
  const [targetStatus, setTargetStatus] = useState<BedStatus>("MAINTENANCE");
  const [tenantId, setTenantId] = useState("a0000000-0000-0000-0000-000000000005"); // Default to seeded Manas Mishra
  const [monthlyRent, setMonthlyRent] = useState<number>(bed?.monthly_rent || 8000);
  const [depositAmount, setDepositAmount] = useState<number>((bed?.monthly_rent || 8000) * 2);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!bed) return null;

  const handleUpdateStatus = async (statusToSet: BedStatus) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await api.rooms.updateBedStatus(bed.id, statusToSet);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update bed status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.allocations.create({
        bed_id: bed.id,
        tenant_id: tenantId,
        monthly_rent: Number(monthlyRent),
        deposit_amount: Number(depositAmount),
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to allocate bed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bed Management — ${bed.bed_code}`}
      description={`Room ${roomNumber || "N/A"} · Current status: ${bed.status}`}
    >
      <div className="space-y-4">
        {/* Bed Status Summary */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BedDouble className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white">{bed.bed_code}</div>
              <div className="text-[10px] text-slate-400">₹{bed.monthly_rent?.toLocaleString()}/month</div>
            </div>
          </div>
          <BedStatusBadge status={bed.status} />
        </div>

        {bed.current_tenant_name && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            Current Resident: <strong className="text-white">{bed.current_tenant_name}</strong>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Action Switcher */}
        {bed.status === "AVAILABLE" && (
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActionType("STATUS")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                actionType === "STATUS" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Status Operations
            </button>
            <button
              type="button"
              onClick={() => setActionType("ALLOCATE")}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                actionType === "ALLOCATE" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Allocate Resident
            </button>
          </div>
        )}

        {/* Allocate Form */}
        {actionType === "ALLOCATE" && bed.status === "AVAILABLE" ? (
          <form onSubmit={handleAllocate} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Select Tenant
              </label>
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090D14] border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="a0000000-0000-0000-0000-000000000005">Manas Mishra (manas@staynest.com)</option>
                <option value="a0000000-0000-0000-0000-000000000006">Rahul Joshi (rahul.joshi@staynest.com)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D14] border border-white/15 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Deposit (₹)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#090D14] border border-white/15 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Allocation Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Move-in scheduled for Monday"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#090D14] border border-white/15 text-xs text-white"
              />
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full mt-2">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Confirm Bed Allocation</span>
            </Button>
          </form>
        ) : (
          /* Status Actions */
          <div className="space-y-3 pt-1">
            <div className="text-xs text-slate-400">Update bed operational availability:</div>
            <div className="grid grid-cols-2 gap-2">
              {bed.status !== "AVAILABLE" && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={() => handleUpdateStatus("AVAILABLE")}
                  className="justify-start text-emerald-400 hover:text-emerald-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Available</span>
                </Button>
              )}

              {bed.status !== "MAINTENANCE" && bed.status !== "OCCUPIED" && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={() => handleUpdateStatus("MAINTENANCE")}
                  className="justify-start text-amber-400 hover:text-amber-300"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Mark Maintenance</span>
                </Button>
              )}

              {bed.status !== "RESERVED" && bed.status !== "OCCUPIED" && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={() => handleUpdateStatus("RESERVED")}
                  className="justify-start text-purple-400 hover:text-purple-300"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Mark Reserved</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
