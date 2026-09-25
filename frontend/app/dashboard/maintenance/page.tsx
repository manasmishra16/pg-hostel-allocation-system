"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Calendar,
  Plus,
  CheckCircle2,
  TrendingDown,
  Building,
  Sparkles,
  RefreshCw,
  X,
  Droplets,
  Zap,
  Wifi,
  Layers,
  ThermometerSnowflake
} from "lucide-react";
import {
  maintenanceApi,
  PropertyMaintenanceRiskResponse,
  PreventiveAction,
} from "@/lib/api/maintenance";
import { propertiesApi } from "@/lib/api/properties";
import { useAuth } from "@/lib/auth-context";

const CATEGORY_ICONS: Record<string, any> = {
  PLUMBING: Droplets,
  ELECTRICAL: Zap,
  WIFI: Wifi,
  HVAC: ThermometerSnowflake,
  STRUCTURE: Layers,
  DEFAULT: Wrench,
};

export default function MaintenanceRiskPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [riskData, setRiskData] = useState<PropertyMaintenanceRiskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New action modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formCategory, setFormCategory] = useState("PLUMBING");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRisk, setFormRisk] = useState("MEDIUM");
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formCost, setFormCost] = useState("1500");

  useEffect(() => {
    propertiesApi
      .getAll()
      .then((data) => {
        setProperties(data);
        if (data.length > 0) {
          setSelectedPropertyId(data[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const fetchRisk = async (propId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceApi.getPropertyRisk(propId);
      setRiskData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load predictive maintenance metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPropertyId) {
      fetchRisk(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !formTitle || !formDescription) return;

    try {
      setSubmitting(true);
      await maintenanceApi.createAction({
        property_id: selectedPropertyId,
        category: formCategory,
        title: formTitle,
        description: formDescription,
        risk_level: formRisk,
        scheduled_date: formDate || null,
        cost_estimate: parseFloat(formCost) || null,
      });
      setShowModal(false);
      setFormTitle("");
      setFormDescription("");
      // Refresh
      fetchRisk(selectedPropertyId);
    } catch (err: any) {
      alert(err.message || "Failed to create preventive maintenance action");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (actionId: string, newStatus: string) => {
    try {
      await maintenanceApi.updateAction(actionId, { status: newStatus });
      if (selectedPropertyId) {
        fetchRisk(selectedPropertyId);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update action status");
    }
  };

  const isStaffOrOwner =
    user?.role === "PROPERTY_OWNER" ||
    user?.role === "WARDEN" ||
    user?.role === "STAFF" ||
    user?.role === "SUPER_ADMIN";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header & Property Selector */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0E1528] via-[#101B33] to-[#0A1224] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Statistical Risk Engine
              </span>
              <span className="text-xs text-slate-400">Zero AI Hallucination · Deterministic Historical Math</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Predictive Maintenance & Health Index
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Real-time failure risk evaluated from historical complaint recurrence, failure frequency in 90-day windows, and resolution MTTR across property assets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {properties.length > 1 && (
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0B1120] text-white">
                    {p.name} ({p.locality})
                  </option>
                ))}
              </select>
            )}

            {isStaffOrOwner && (
              <button
                onClick={() => setShowModal(true)}
                className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Preventive Action</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center space-y-3 text-slate-400">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-sm font-medium">Computing statistical failure risk from complaint logs...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {riskData && !loading && (
        <div className="space-y-8">
          {/* Overall Property Risk Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#0B1120]/90 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Asset Risk
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {riskData.overall_risk_score}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
                <span
                  className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    riskData.overall_risk_level === "HIGH"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : riskData.overall_risk_level === "MEDIUM"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  }`}
                >
                  {riskData.overall_risk_level} RISK
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Aggregated composite health across all utility systems.</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0B1120]/90 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Historical Logged Tickets
              </span>
              <div className="text-3xl font-extrabold text-white">
                {riskData.total_historical_complaints}
              </div>
              <p className="text-[10px] text-slate-400">Total lifetime maintenance events recorded on ledger.</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0B1120]/90 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                High Risk Rooms
              </span>
              <div className="text-3xl font-extrabold text-amber-300">
                {riskData.high_risk_rooms.length}
              </div>
              <p className="text-[10px] text-slate-400">Rooms with 2+ recurring issues in past 90 days.</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0B1120]/90 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Scheduled Interventions
              </span>
              <div className="text-3xl font-extrabold text-emerald-300">
                {riskData.recommended_actions.length}
              </div>
              <p className="text-[10px] text-slate-400">Active preventive maintenance work orders.</p>
            </div>
          </div>

          {/* System Category Risk Breakdown */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Utility & System Risk Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {riskData.category_risks.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.category] || CATEGORY_ICONS.DEFAULT;
                return (
                  <div
                    key={cat.category}
                    className="p-5 rounded-3xl bg-[#0B1120]/90 border border-white/10 space-y-4 shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-white">{cat.category}</div>
                          <div className="text-[10px] text-slate-400">
                            {cat.complaint_count_90d} incidents in 90d
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          cat.risk_level === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : cat.risk_level === "HIGH"
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            : cat.risk_level === "MEDIUM"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {cat.risk_score}/100 · {cat.risk_level}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cat.risk_score >= 60
                              ? "bg-rose-500"
                              : cat.risk_score >= 30
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(cat.risk_score, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Reason points */}
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      {cat.reasons.map((r, i) => (
                        <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                          <span className="text-slate-500 text-[10px]">•</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High-Risk Room Section */}
          {riskData.high_risk_rooms.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                High-Attention Rooms (Recurrence Pattern)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskData.high_risk_rooms.map((rm) => (
                  <div
                    key={rm.room_id}
                    className="p-4 rounded-2xl bg-amber-500/[0.07] border border-amber-500/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Room {rm.room_number}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {rm.risk_score} pts · {rm.risk_level}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      {rm.reasons.map((r, i) => (
                        <div key={i}>• {r}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preventive Work Orders & Recommendations Table */}
          <div className="bg-[#0B1120]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  Preventive Maintenance Work Orders
                </h2>
                <p className="text-xs text-slate-400">
                  Scheduled inspections, valve replacements, and servicing actions persisted to database.
                </p>
              </div>
            </div>

            {riskData.recommended_actions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No preventive actions scheduled. Click above to schedule proactive maintenance.
              </div>
            ) : (
              <div className="divide-y divide-white/5 overflow-x-auto">
                {riskData.recommended_actions.map((act) => (
                  <div key={act.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-white">{act.title}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            act.status === "COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : act.status === "SCHEDULED"
                              ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          {act.status}
                        </span>
                        <span className="text-[10px] text-slate-500">Category: {act.category}</span>
                      </div>
                      <p className="text-xs text-slate-400">{act.description}</p>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1">
                        {act.room_number && <span>Target: Room {act.room_number}</span>}
                        {act.scheduled_date && <span>Scheduled: {act.scheduled_date}</span>}
                        {act.assigned_staff_name && <span>Assignee: {act.assigned_staff_name}</span>}
                        {act.cost_estimate && <span>Cost Est: ₹{act.cost_estimate.toFixed(0)}</span>}
                      </div>
                    </div>

                    {isStaffOrOwner && act.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleUpdateStatus(act.id, "COMPLETED")}
                        className="py-1.5 px-3.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0C1424] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Schedule Preventive Action</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                  >
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="HVAC">HVAC / Cooling</option>
                    <option value="WIFI">WiFi & Networking</option>
                    <option value="STRUCTURE">Structural / Furniture</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Risk Level</label>
                  <select
                    value={formRisk}
                    onChange={(e) => setFormRisk(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bathroom Flush Valve Overhaul"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Scope of Work</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of preventive checks, parts to be inspected or replaced..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Scheduled Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cost Estimate (₹)</label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all cursor-pointer mt-2"
              >
                {submitting ? "Saving to Database..." : "Commit Preventive Action to Database"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
