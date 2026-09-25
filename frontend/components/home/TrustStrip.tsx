"use client";

import Link from "next/link";
import { ShieldCheck, Users, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const stats = [
  { value: "500+", label: "Verified Properties" },
  { value: "47K+", label: "Happy Residents" },
  { value: "25+", label: "Prime Localities" },
  { value: "4.8/5", label: "Average Rating" },
];

const values = [
  {
    icon: Zap,
    title: "Discrete Bed Booking",
    desc: "Reserve an exact bed — no double bookings, total pricing transparency.",
    color: "emerald" as const,
  },
  {
    icon: Users,
    title: "Smart Roommate Matching",
    desc: "5-factor compatibility engine for sleep, cleanliness & lifestyle.",
    color: "teal" as const,
  },
  {
    icon: ShieldCheck,
    title: "Instant Digital Payments",
    desc: "One-click rent, auto receipts, and AI-triaged maintenance support.",
    color: "amber" as const,
  },
];

const colorMap = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  teal: { bg: "bg-teal-500/10", border: "border-teal-500/20", text: "text-teal-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function TrustStrip() {
  const { user } = useAuth();
  const isOwner = user?.role === "PROPERTY_OWNER";

  return (
    <section
      id="why-staynest"
      className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-7xl mx-auto w-full space-y-8 border-t border-white/5"
    >
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl glass-card text-center"
          >
            <div className="text-xl sm:text-2xl font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {values.map((v) => {
          const c = colorMap[v.color];
          const Icon = v.icon;
          return (
            <div
              key={v.title}
              className="p-5 rounded-xl glass-card space-y-2"
            >
              <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center ${c.text}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-[13px] font-semibold text-white">{v.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Property Owner CTA */}
      <div className="p-6 sm:p-8 rounded-xl sm:rounded-2xl glass-panel border border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <TrendingUp className="w-2.5 h-2.5" />
            For Property Owners
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            List your property on StayNest
          </h2>
          <p className="text-[11px] text-slate-500">
            Get verified tenants, automated rent collections, and enterprise analytics.
          </p>
        </div>

        <div className="flex gap-2 shrink-0 w-full sm:w-auto relative z-10">
          <Link
            href="/owner/properties/new"
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-[11px] transition-all shadow-md shadow-emerald-500/15 text-center hover:scale-[1.02] active:scale-[0.98]"
          >
            List Property
          </Link>
          <Link
            href={isOwner ? "/owner/dashboard" : "/login"}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/8 text-white font-medium text-[11px] transition-colors text-center"
          >
            {isOwner ? "Owner Dashboard" : "Owner Login"}
          </Link>
        </div>
      </div>
    </section>
  );
}
