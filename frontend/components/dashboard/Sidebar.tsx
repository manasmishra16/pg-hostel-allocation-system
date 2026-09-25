"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Home,
  CreditCard,
  AlertCircle,
  Bell,
  Users,
  FileText,
  User,
  LogOut,
  Building,
  KeyRound,
  BarChart3,
  CalendarCheck,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Wrench,
  Settings,
  Layers,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || "TENANT";

  // 1. TENANT Navigation
  const tenantNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Move-In", href: "/dashboard/move-in", icon: CalendarCheck },
    { name: "My Room", href: "/dashboard/room", icon: Home },
    { name: "Roommates", href: "/dashboard/roommates", icon: Users },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Complaints", href: "/dashboard/complaints", icon: AlertCircle },
    { name: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
    { name: "Notices", href: "/dashboard/notices", icon: Bell },
    { name: "Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Profile", href: "/profile", icon: User },
  ];

  // 2. PROPERTY OWNER Navigation
  const ownerNav = [
    { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
    { name: "Properties", href: "/owner/properties", icon: Building },
    { name: "Rooms & Beds", href: "/owner/rooms", icon: KeyRound },
    { name: "Tenants", href: "/owner/tenants", icon: Users },
    { name: "Staff", href: "/owner/staff", icon: User },
    { name: "Payments", href: "/owner/payments", icon: CreditCard },
    { name: "Complaints", href: "/owner/complaints", icon: AlertCircle },
    { name: "Notices", href: "/owner/notices", icon: Bell },
    { name: "Analytics", href: "/owner/analytics", icon: BarChart3 },
  ];

  // 3. WARDEN Navigation
  const wardenNav = [
    { name: "Dashboard", href: "/warden/dashboard", icon: LayoutDashboard },
    { name: "Residents", href: "/warden/residents", icon: Users },
    { name: "Rooms & Beds", href: "/warden/rooms", icon: KeyRound },
    { name: "Allocations", href: "/warden/allocations", icon: CalendarCheck },
    { name: "Complaints", href: "/warden/complaints", icon: AlertCircle },
    { name: "Notices", href: "/warden/notices", icon: Bell },
  ];

  // 4. STAFF Navigation
  const staffNav = [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "Residents", href: "/staff/residents", icon: Users },
    { name: "Allocations", href: "/staff/allocations", icon: CalendarCheck },
    { name: "Complaints", href: "/staff/complaints", icon: AlertCircle },
    { name: "Maintenance", href: "/staff/maintenance", icon: Wrench },
    { name: "Notices", href: "/staff/notices", icon: Bell },
  ];

  // 5. SUPER ADMIN Navigation
  const adminNav = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Organizations", href: "/admin/organizations", icon: Layers },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Properties", href: "/admin/properties", icon: Building },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
    { name: "System Settings", href: "/admin/settings", icon: Settings },
  ];

  const currentNav =
    role === "PROPERTY_OWNER"
      ? ownerNav
      : role === "WARDEN"
      ? wardenNav
      : role === "STAFF"
      ? staffNav
      : role === "SUPER_ADMIN"
      ? adminNav
      : tenantNav;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0F1D]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
        {currentNav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium text-slate-400 hover:text-white cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex">
          <div className="w-72 bg-[#0C1220] h-full p-6 flex flex-col justify-between border-r border-white/10 shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-lg">StayNest</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider px-2">
                {role.replace("_", " ")} PORTAL
              </div>

              <nav className="space-y-1">
                {currentNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 cursor-pointer mt-6"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={`hidden lg:flex flex-col justify-between bg-[#0A0F1E]/95 backdrop-blur-2xl border-r border-white/5 select-none shrink-0 transition-all duration-300 relative z-30 ${
          collapsed ? "w-20 p-4" : "w-64 p-5"
        } min-h-screen`}
      >
        <div className="space-y-6">
          {/* Brand & Toggle */}
          <div className="flex items-center justify-between px-1">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 group-hover:shadow-emerald-500/50 transition-all shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-extrabold tracking-tight text-white">StayNest</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PRO</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/90 font-medium tracking-wider uppercase">
                    {role.replace("_", " ")}
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 items-center justify-center text-slate-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              // Contextual badges
              let badge: { text: string; color: string; glow?: string } | null = null;
              if (role === "TENANT") {
                if (item.name === "Payments") badge = { text: "Due", color: "bg-amber-500/15 text-amber-300 border-amber-500/30", glow: "shadow-amber-500/20" };
                else if (item.name === "Move-In") badge = { text: "Active", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", glow: "shadow-emerald-500/20" };
                else if (item.name === "Complaints") badge = { text: "2 Open", color: "bg-rose-500/15 text-rose-300 border-rose-500/30", glow: "shadow-rose-500/20" };
                else if (item.name === "Notices") badge = { text: "3 New", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", glow: "shadow-emerald-500/20" };
                else if (item.name === "My Room") badge = { text: "A-101", color: "bg-teal-500/15 text-teal-300 border-teal-500/30" };
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "text-emerald-400 scale-110" : "text-slate-400"}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!collapsed && badge && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${badge.color} ${badge.glow || ""}`}>
                      {badge.text}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer & Persona Info */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          {!collapsed && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 flex items-center gap-3 shadow-inner">
              <div className="relative shrink-0">
                <img
                  src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt="User"
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A0F1E]" />
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white truncate">{user?.full_name || "Resident"}</span>
                  <span title="KYC Verified" className="inline-flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>Room A-101 · Active Bed</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

