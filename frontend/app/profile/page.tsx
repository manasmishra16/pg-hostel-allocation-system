"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/layout/Navbar";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  CheckCircle2,
  Calendar,
  Building,
  Save,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {/* Profile Card Header */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/40 overflow-hidden shrink-0 shadow-xl shadow-emerald-500/10">
              <img
                src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                alt={user?.full_name || "Profile"}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl font-bold text-white">{user?.full_name || "Resident User"}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {user?.role || "TENANT"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> KYC Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user?.email || "resident@staynest.internal"}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Member of StayNest PG & Hostel Ecosystem since August 2026
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage your identity credentials and contact settings</p>
            </div>
            {isSaved && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> Profile Updated
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Legal Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Primary Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Managed via StayNest single sign-on authentication</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Ecosystem Role</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={user?.role || "TENANT"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-emerald-400 font-bold uppercase cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security & Access Section */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Security & Permissions</h3>
              <p className="text-xs text-slate-400">JWT Token Session & Role-Based Access Control</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Session Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active (Bearer JWT)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Authentication Level</span>
              <span className="font-semibold text-white">PBKDF2 SHA-256 Encrypted</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Organization / Campus Access</span>
              <span className="font-semibold text-white">Green Glen Residency & HSR Campus</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
