"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  FileSignature,
  CreditCard,
  ClipboardCheck,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  UserCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  FileText,
  BadgeCheck,
  RefreshCw,
  Home
} from "lucide-react";
import { moveInApi, MoveInWorkflow, MoveInStatus } from "@/lib/api/moveIn";
import { useAuth } from "@/lib/auth-context";

const STAGES: {
  key: MoveInStatus;
  title: string;
  desc: string;
  icon: any;
}[] = [
  {
    key: "KYC_SUBMITTED",
    title: "1. KYC Verification",
    desc: "Aadhaar / Govt ID & tenant background check",
    icon: ShieldCheck,
  },
  {
    key: "AGREEMENT_SIGNED",
    title: "2. Tenancy Agreement",
    desc: "11-month digital PG agreement execution",
    icon: FileSignature,
  },
  {
    key: "DEPOSIT_PAID",
    title: "3. Security Deposit",
    desc: "Deposit & first month advance clearance",
    icon: CreditCard,
  },
  {
    key: "INSPECTION_COMPLETED",
    title: "4. Room Inspection",
    desc: "Physical audit of electrical, plumbing & furniture",
    icon: ClipboardCheck,
  },
  {
    key: "KEY_HANDED_OVER",
    title: "5. Key Handover",
    desc: "Issuance of room & locker physical key set",
    icon: KeyRound,
  },
  {
    key: "MOVE_IN_COMPLETED",
    title: "6. Active Resident",
    desc: "Physical occupancy confirmed & verified",
    icon: CheckCircle2,
  },
];

const STAGE_ORDER: MoveInStatus[] = [
  "INITIATED",
  "KYC_SUBMITTED",
  "KYC_VERIFIED",
  "AGREEMENT_SIGNED",
  "DEPOSIT_PAID",
  "INSPECTION_COMPLETED",
  "KEY_HANDED_OVER",
  "MOVE_IN_COMPLETED",
];

export default function MoveInReadinessPage() {
  const { user } = useAuth();
  const [workflow, setWorkflow] = useState<MoveInWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form inputs for modals/actions
  const [signatureName, setSignatureName] = useState(user?.full_name || "");
  const [keyNumber, setKeyNumber] = useState("KEY-A101-01");
  const [inspectionNotes, setInspectionNotes] = useState(
    "All electrical switches, ceiling fan, mattress and bathroom fittings inspected in prime condition."
  );

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await moveInApi.getStatus();
      setWorkflow(data);
      if (user?.full_name && !signatureName) {
        setSignatureName(user.full_name);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load move-in readiness status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAction = async (action: any, payload: Record<string, any> = {}) => {
    if (!workflow) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMsg(null);
      const updated = await moveInApi.executeAction(workflow.id, {
        action,
        ...payload,
      });
      setWorkflow(updated);
      setSuccessMsg(`Action ${action.replace("_", " ")} recorded successfully.`);
    } catch (err: any) {
      setError(err.message || `Failed to perform ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStageIndex = (status: MoveInStatus) => {
    const idx = STAGE_ORDER.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  const currentIdx = workflow ? getStageIndex(workflow.status) : 0;
  const isOwnerOrWarden =
    user?.role === "PROPERTY_OWNER" ||
    user?.role === "WARDEN" ||
    user?.role === "STAFF" ||
    user?.role === "SUPER_ADMIN";

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm font-medium">Querying Move-In State Machine from PostgreSQL...</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
          <Building2 className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Move-In Workflow Found</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          You currently do not have a reserved bed awaiting move-in. Reserve a bed from properties or contact your hostel warden.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0C1527] via-[#0E1A30] to-[#0A1222] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified State Machine
              </span>
              <span className="text-xs text-slate-400">ID: {workflow.id.slice(0, 8)}...</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Move-In Readiness & Key Handover
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Strict multi-party onboarding workflow tracking KYC, legal tenancy agreement, security deposit, physical room inspection, and key custody.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Accommodation
            </span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              <span>{workflow.property_name}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400">
              Room {workflow.room_number} · {workflow.bed_code}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* 6-Stage Progress Stepper */}
      <div className="bg-[#0B1120]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Onboarding Lifecycle Stages
          </h2>
          <span className="text-xs font-bold text-slate-400">
            Stage {Math.min(currentIdx + 1, 6)} of 6
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const stageStepIdx = i + 1; // 1-based
            const isCompleted = currentIdx >= stageStepIdx;
            const isCurrent = currentIdx === stageStepIdx - 1;

            return (
              <div
                key={stage.key}
                className={`relative rounded-2xl p-4 transition-all border flex flex-col justify-between gap-3 ${
                  isCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                    : isCurrent
                    ? "bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-emerald-500/50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40"
                    : "bg-white/[0.02] border-white/5 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isCompleted
                        ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30"
                        : isCurrent
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">
                    {isCompleted ? "DONE" : isCurrent ? "ACTIVE" : "PENDING"}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className={`text-xs font-bold ${isCurrent || isCompleted ? "text-white" : "text-slate-400"}`}>
                    {stage.title}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Action & Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Action Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0B1120]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Current Required Action
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {workflow.status === "INITIATED" && "Step 1: Submit Identity KYC"}
                  {workflow.status === "KYC_SUBMITTED" && "Step 1: KYC Awaiting Staff Verification"}
                  {workflow.status === "KYC_VERIFIED" && "Step 2: Sign Tenancy Agreement"}
                  {workflow.status === "AGREEMENT_SIGNED" && "Step 3: Pay Security Deposit"}
                  {workflow.status === "DEPOSIT_PAID" && "Step 4: Conduct Physical Room Inspection"}
                  {workflow.status === "INSPECTION_COMPLETED" && "Step 5: Handover Room & Locker Keys"}
                  {workflow.status === "KEY_HANDED_OVER" && "Step 6: Confirm Final Move-In"}
                  {workflow.status === "MOVE_IN_COMPLETED" && "Onboarding Completed"}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-300">
                Status: {workflow.status}
              </span>
            </div>

            {/* ACTION 1: INITIATED -> SUBMIT KYC */}
            {workflow.status === "INITIATED" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Please upload your government-issued identity proof (Aadhaar, Passport, or Voter ID) and student/employment credentials to initiate verification.
                </p>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="text-xs font-bold text-white">Document Type: Government Aadhaar / National ID</div>
                  <div className="text-xs text-slate-400">Standard verification protocol under Bengaluru PG municipal compliance rules.</div>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("SUBMIT_KYC", { notes: "Aadhaar Card uploaded via StayNest Resident Portal" })}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit KYC Document</span>
                </button>
              </div>
            )}

            {/* ACTION 2: KYC_SUBMITTED -> VERIFY KYC */}
            {workflow.status === "KYC_SUBMITTED" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Tenant documents have been submitted to PostgreSQL and are queued for warden review.
                </p>
                {isOwnerOrWarden ? (
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <UserCheck className="w-4 h-4" />
                      <span>Warden/Staff Action Required: Verify Tenant Credentials</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      You are logged in as authorized personnel ({user?.role}). Review tenant identity and approve to allow agreement execution.
                    </p>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction("VERIFY_KYC", { notes: `Verified against official records by ${user?.full_name}` })}
                      className="py-2.5 px-5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Verify Tenant KYC</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Awaiting review by Property Warden Rajesh Sharma. Verification usually completes within 2 business hours.</span>
                  </div>
                )}
              </div>
            )}

            {/* ACTION 3: KYC_VERIFIED -> SIGN AGREEMENT */}
            {workflow.status === "KYC_VERIFIED" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  KYC verification is completed. Review the official 11-month electronic PG Tenancy Agreement and apply your digital signature below.
                </p>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Agreement Term: 11 Months</span>
                    <span>Notice Period: 30 Days</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Electronic Signature (Type Full Legal Name):</label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Enter legal name to sign"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
                <button
                  disabled={actionLoading || !signatureName.trim()}
                  onClick={() => handleAction("SIGN_AGREEMENT", { signature: signatureName })}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileSignature className="w-4 h-4" />
                  <span>Digitally Sign Tenancy Agreement</span>
                </button>
              </div>
            )}

            {/* ACTION 4: AGREEMENT_SIGNED -> PAY DEPOSIT */}
            {workflow.status === "AGREEMENT_SIGNED" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Agreement signed successfully by {workflow.agreement_signed_at ? "Resident" : "Tenant"}. Pay the refundable security deposit to proceed to room inspection.
                </p>
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Security Deposit Amount</div>
                    <div className="text-2xl font-extrabold text-white">₹16,000.00</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">100% Refundable at checkout per agreement clause 4</div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("PAY_DEPOSIT", { payment_id: `TXN-${Date.now().toString().slice(-6)}` })}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Simulate Payment & Settle Security Deposit</span>
                </button>
              </div>
            )}

            {/* ACTION 5: DEPOSIT_PAID -> COMPLETE INSPECTION */}
            {workflow.status === "DEPOSIT_PAID" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Deposit received. A warden physical room inspection is required before keys can be issued.
                </p>
                {isOwnerOrWarden ? (
                  <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-4">
                    <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Warden Room Audit Checklist</span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Inspection Observations & Checklist:</label>
                      <textarea
                        rows={3}
                        value={inspectionNotes}
                        onChange={(e) => setInspectionNotes(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <button
                      disabled={actionLoading}
                      onClick={() =>
                        handleAction("COMPLETE_INSPECTION", {
                          inspection_passed: true,
                          inspection_notes: inspectionNotes,
                        })
                      }
                      className="py-2.5 px-5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <BadgeCheck className="w-4 h-4" />
                      <span>Certify Room Inspection Passed</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span>Warden is inspecting Room {workflow.room_number}. You will receive a notification once certified.</span>
                  </div>
                )}
              </div>
            )}

            {/* ACTION 6: INSPECTION_COMPLETED -> HANDOVER KEYS */}
            {workflow.status === "INSPECTION_COMPLETED" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Room inspection has passed. The physical key set can now be assigned and handed over to the resident.
                </p>
                {isOwnerOrWarden ? (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <KeyRound className="w-4 h-4" />
                      <span>Record Physical Key Custody</span>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Key Tag / Serial Number:</label>
                      <input
                        type="text"
                        value={keyNumber}
                        onChange={(e) => setKeyNumber(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAction("HANDOVER_KEYS", { key_number: keyNumber })}
                      className="py-2.5 px-5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Confirm Physical Key Handover</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-slate-400 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Please collect your physical keys from Warden Desk, Ground Floor Block A.</span>
                  </div>
                )}
              </div>
            )}

            {/* ACTION 7: KEY_HANDED_OVER -> COMPLETE MOVE IN */}
            {workflow.status === "KEY_HANDED_OVER" && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center shrink-0">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">Keys Issued: {workflow.key_number}</div>
                    <div className="text-xs text-emerald-300">All preliminary inspections & custody transfers completed.</div>
                  </div>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("COMPLETE_MOVE_IN")}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalize Move-In & Activate Resident Digital Hub</span>
                </button>
              </div>
            )}

            {/* STATUS: MOVE_IN_COMPLETED */}
            {workflow.status === "MOVE_IN_COMPLETED" && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white">You Are Officially Moved In!</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your physical bed allocation in Room {workflow.room_number} ({workflow.bed_code}) is active. You have full access to hostel facilities, dining mess, and high-speed fiber Wi-Fi.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Verified Audit Trail Timeline */}
        <div className="space-y-6">
          <div className="bg-[#0B1120]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                PostgreSQL Audit Trail
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {workflow.audit_logs.length} Entries
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {workflow.audit_logs.map((log, i) => (
                <div key={log.id} className="relative pl-6 pb-4 border-l border-white/10 last:border-l-0 last:pb-0">
                  <span className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#0B1120]" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-tight">
                        {log.action.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{log.notes}</p>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>By:</span>
                      <span className="text-emerald-400 font-semibold">{log.performer_name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
