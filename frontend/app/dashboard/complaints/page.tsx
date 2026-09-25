"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Complaint } from "@/lib/api";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  Wrench,
  Zap,
  Wifi,
  Sparkles,
  Utensils,
  ShieldAlert,
  Bot,
  ArrowRight,
  Filter,
  User,
  X,
  Calendar,
  Check
} from "lucide-react";
import Header from "@/components/dashboard/Header";

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "resolved">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("plumbing");
  const [priority, setPriority] = useState("medium");
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    priority: string;
    department: string;
    summary: string;
  } | null>(null);

  useEffect(() => {
    loadComplaints();
  }, [user]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const data = await api.getComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAITriage = async () => {
    if (!description || description.trim().length < 8) return;
    try {
      setAiTriageLoading(true);
      const triage = await api.triageComplaint(description);
      setAiSuggestion(triage);
      if (triage.category) setCategory(triage.category.toLowerCase());
      if (triage.priority) setPriority(triage.priority.toLowerCase());
    } catch (err) {
      console.error("AI Triage error:", err);
    } finally {
      setAiTriageLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createComplaint({
        title,
        description,
        category,
        priority,
      });
      setShowModal(false);
      setTitle("");
      setDescription("");
      setAiSuggestion(null);
      loadComplaints();
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "all") return true;
    if (filter === "pending") return c.status === "PENDING";
    if (filter === "in_progress") return c.status === "IN_PROGRESS" || c.status === "ASSIGNED";
    if (filter === "resolved") return c.status === "RESOLVED";
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("plumb")) return <Wrench className="w-4 h-4 text-emerald-400" />;
    if (c.includes("elect")) return <Zap className="w-4 h-4 text-amber-400" />;
    if (c.includes("wifi") || c.includes("internet")) return <Wifi className="w-4 h-4 text-blue-400" />;
    if (c.includes("clean")) return <Sparkles className="w-4 h-4 text-teal-300" />;
    if (c.includes("food")) return <Utensils className="w-4 h-4 text-orange-400" />;
    return <AlertCircle className="w-4 h-4 text-rose-400" />;
  };

  const getTimelineStep = (status: string) => {
    const s = status.toUpperCase();
    if (s === "RESOLVED") return 4;
    if (s === "IN_PROGRESS") return 3;
    if (s === "ASSIGNED") return 2;
    return 1; // Submitted
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Header
            title="Maintenance & Support Center"
            subtitle="AI-triaged incident tickets with transparent 4-stage resolution tracking."
          />

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Ticket</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          {[
            { id: "all", label: "All Tickets" },
            { id: "pending", label: "Pending Triage" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filter === f.id
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "glass-pill text-slate-300 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Complaints Ticket Cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 rounded-3xl glass-card animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredComplaints.length > 0 ? (
          <div className="space-y-4">
            {filteredComplaints.map((c) => {
              const currentStep = getTimelineStep(c.status);

              return (
                <div
                  key={c.id}
                  className="p-6 sm:p-7 rounded-3xl glass-card border border-white/10 space-y-5 shadow-xl hover:border-white/20 transition-all"
                >
                  {/* Top Bar: Category, Priority, Status, Created, Assigned staff */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getCategoryIcon(c.category)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{c.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="capitalize">{c.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(c.created_at).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/5 border border-white/10 text-slate-300">
                        Priority: {c.priority}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          c.status === "RESOLVED"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : c.status === "IN_PROGRESS"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {c.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {c.description}
                  </p>

                  {/* Assigned Staff Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Assigned Staff:{" "}
                      <strong className="text-white font-semibold">
                        {(c as any).assigned_staff_name || "Hostel Maintenance Desk (Ramu)"}
                      </strong>
                    </span>
                  </div>

                  {/* 4-Step Resolution Timeline: Submitted -> Assigned -> In Progress -> Resolved */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span className={currentStep >= 1 ? "text-emerald-400" : ""}>1. Submitted</span>
                      <span className={currentStep >= 2 ? "text-emerald-400" : ""}>2. Assigned</span>
                      <span className={currentStep >= 3 ? "text-emerald-400" : ""}>3. In Progress</span>
                      <span className={currentStep >= 4 ? "text-emerald-400" : ""}>4. Resolved</span>
                    </div>

                    <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 rounded-3xl glass-panel text-center space-y-3 max-w-md mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No maintenance tickets</h3>
            <p className="text-xs text-slate-400">All hostel systems and room fixtures are operating smoothly.</p>
          </div>
        )}

        {/* Raise Ticket Modal with AI Triage Suggestion Panel */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl glass-modal p-6 sm:p-8 space-y-6 relative border border-white/15 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white absolute top-6 right-6"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Raise Maintenance Ticket</h3>
                  <p className="text-xs text-slate-400">AI triage auto-categorizes and routes your issue.</p>
                </div>
              </div>

              <form onSubmit={handleCreateComplaint} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Issue Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bathroom hot water geyser not heating"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-white">Detailed Description</label>
                    <span className="text-[10px] text-slate-400">Type description for AI triage</span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the problem, when it began, and any safety concerns..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleAITriage}
                    className="w-full px-4 py-3 rounded-2xl glass-input text-xs leading-relaxed"
                  />
                </div>

                {/* Subtle & Professional AI Suggestion Panel */}
                {aiSuggestion && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Bot className="w-4 h-4" />
                      <span>StayNest AI Triage Assistant</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Auto-detected department: <strong className="text-white">{aiSuggestion.department}</strong>. Urgency: <strong className="text-white uppercase">{aiSuggestion.priority}</strong>.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs"
                    >
                      <option value="plumbing" className="bg-[#0F172A] text-white">Plumbing</option>
                      <option value="electrical" className="bg-[#0F172A] text-white">Electrical</option>
                      <option value="internet" className="bg-[#0F172A] text-white">WiFi / Internet</option>
                      <option value="housekeeping" className="bg-[#0F172A] text-white">Housekeeping</option>
                      <option value="food" className="bg-[#0F172A] text-white">Food / Mess</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl glass-input text-xs"
                    >
                      <option value="low" className="bg-[#0F172A] text-white">Low</option>
                      <option value="medium" className="bg-[#0F172A] text-white">Medium</option>
                      <option value="high" className="bg-[#0F172A] text-white">High (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-xl shadow-emerald-500/20"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
