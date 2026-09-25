"use client";

import React, { useState } from "react";
import Header from "@/components/dashboard/Header";
import {
  Settings,
  Server,
  Key,
  Shield,
  Bell,
  CheckCircle2,
  Save,
  Lock,
  Database,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8000/api/v1");
  const [jwtExpiry, setJwtExpiry] = useState("72");
  const [enableWhatsapp, setEnableWhatsapp] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableEscalationCron, setEnableEscalationCron] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="System Configuration & Platform Governance"
        subtitle="Global environmental variables, microservice endpoints, and payment gateway parameters."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Infrastructure */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Backend Services & Gateway Core</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">FastAPI REST microservices and database clustering</p>
            </div>
            {isSaved && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Parameters Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">FastAPI Base Endpoint</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Mounted via /api/v1 prefix router</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">JWT Session Expiry (Hours)</label>
              <input
                type="number"
                value={jwtExpiry}
                onChange={(e) => setJwtExpiry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">ACCESS_TOKEN_EXPIRE_MINUTES configuration</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white">PostgreSQL Connection Pool</span>
                <p className="text-[11px] text-slate-400">SQLAlchemy 2.0 Engine Pool (20 max connections)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              CONNECTED
            </span>
          </div>
        </div>

        {/* Automated Background Dispatch */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <div className="pb-4 border-b border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Notification Gateways & SLA Cron Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated resident SMS, email, and ticket escalations</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-xs font-bold text-white">WhatsApp Tenant Alerts (Twilio API)</div>
                <div className="text-[11px] text-slate-400">Send instant rent reminders and gate pass PINs</div>
              </div>
              <input
                type="checkbox"
                checked={enableWhatsapp}
                onChange={(e) => setEnableWhatsapp(e.target.checked)}
                className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-xs font-bold text-white">Automated SLA Ticket Escalation</div>
                <div className="text-[11px] text-slate-400">Auto-escalate tickets unattended for over 24 hours</div>
              </div>
              <input
                type="checkbox"
                checked={enableEscalationCron}
                onChange={(e) => setEnableEscalationCron(e.target.checked)}
                className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
