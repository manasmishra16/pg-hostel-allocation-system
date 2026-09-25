"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Notice } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import {
  Bell,
  Pin,
  Calendar,
  Plus,
  AlertCircle,
  Wrench,
} from "lucide-react";

export default function StaffNoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [isPinned, setIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadNotices();
  }, [user]);

  const loadNotices = async () => {
    try {
      setIsLoading(true);
      const data = await api.notices.getAll();
      setNotices(data || []);
    } catch (err) {
      console.error("Failed to load notices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setIsSubmitting(true);
      await api.notices.create({
        title,
        description,
        priority,
        is_pinned: isPinned,
      });
      setShowModal(false);
      setTitle("");
      setDescription("");
      setIsPinned(false);
      await loadNotices();
    } catch (err) {
      console.error("Failed to post notice:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Facility Bulletins & Maintenance Circulars"
          subtitle="Operational updates regarding water shutoffs, electrical shutdowns, and deep cleaning."
        />

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post Maintenance Notice</span>
        </button>
      </div>

      {/* Notices List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border border-white/5">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Bulletins Issued</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Post an advisory to alert residents before planned maintenance shutdowns.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Post Bulletin
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className={`glass-card p-6 rounded-3xl border transition-all ${
                n.is_pinned
                  ? "border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-transparent"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white">{n.title}</h3>
                  {n.is_pinned && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      n.priority === "URGENT" || n.priority === "HIGH"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {n.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  {n.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                  <span>Notice ID: {n.id.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Post Maintenance Notice</h3>
                <p className="text-xs text-slate-400 mt-0.5">Notify residents of facility repair works</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RO Filter Maintenance & Water Tank Cleaning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Details & Schedule</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Details regarding timing, affected floors, and instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="NORMAL" className="bg-[#0B101B]">Routine Maintenance</option>
                  <option value="HIGH" className="bg-[#0B101B]">Service Interruption (High)</option>
                  <option value="URGENT" className="bg-[#0B101B]">Urgent Emergency Shutoff</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNoticeStaff"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="pinNoticeStaff" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Pin to top of resident notice board
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Broadcast Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
