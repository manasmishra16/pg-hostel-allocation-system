"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Building2, User as UserIcon, LogIn, ChevronDown, Sparkles, Check, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout, demoLogin, isLoading } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    if (showRoleMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRoleMenu]);

  const handleRoleSwitch = async (role: "TENANT" | "PROPERTY_OWNER" | "WARDEN" | "STAFF" | "SUPER_ADMIN") => {
    setSwitchingRole(true);
    try {
      await demoLogin(role);
      setShowRoleMenu(false);
    } finally {
      setSwitchingRole(false);
    }
  };

  const dashboardHref =
    user?.role === "PROPERTY_OWNER"
      ? "/owner/dashboard"
      : user?.role === "SUPER_ADMIN"
      ? "/admin/dashboard"
      : user?.role === "WARDEN"
      ? "/warden/dashboard"
      : user?.role === "STAFF"
      ? "/staff/dashboard"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full glass-panel">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
            StayNest
          </span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/properties?property_type=PG" className="hover:text-emerald-400 transition-colors">PGs</Link>
          <Link href="/properties?property_type=HOSTEL" className="hover:text-emerald-400 transition-colors">Hostels</Link>
          <Link href="/properties" className="hover:text-emerald-400 transition-colors">Explore All</Link>
          <Link href="/#why-staynest" className="hover:text-white transition-colors">About</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Persona Switcher for Evaluation */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              disabled={switchingRole}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{switchingRole ? "Switching..." : `Persona: ${user?.role || "Guest"}`}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel p-2 shadow-2xl z-50 text-xs border border-white/10">
                <div className="px-3 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Switch Demo Persona
                </div>
                {[
                  { role: "TENANT", name: "Tenant (Manas)", badge: "bg-emerald-500/20 text-emerald-300" },
                  { role: "PROPERTY_OWNER", name: "Owner (Vikramaditya)", badge: "bg-amber-500/20 text-amber-300" },
                  { role: "WARDEN", name: "Warden (Rajesh)", badge: "bg-blue-500/20 text-blue-300" },
                  { role: "STAFF", name: "Staff (Anita)", badge: "bg-teal-500/20 text-teal-300" },
                  { role: "SUPER_ADMIN", name: "Platform Admin", badge: "bg-purple-500/20 text-purple-300" },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => handleRoleSwitch(item.role as any)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {user?.role === item.role && <Check className="w-3 h-3 text-emerald-400" />}
                      <span className={user?.role === item.role ? "font-semibold text-white" : ""}>
                        {item.name}
                      </span>
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${item.badge}`}>
                      {item.role.replace("PROPERTY_", "").replace("SUPER_", "")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/owner/properties/new"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            List Property
          </Link>

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href={dashboardHref}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs text-slate-400 hover:text-white px-1.5 sm:px-2 py-1 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl glass-panel border border-white/10 space-y-3 text-xs shadow-2xl">
          <nav className="flex flex-col space-y-2 text-slate-300 font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/properties?property_type=PG"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-emerald-400 font-semibold transition-colors"
            >
              PGs (Co-living)
            </Link>
            <Link
              href="/properties?property_type=HOSTEL"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-emerald-400 font-semibold transition-colors"
            >
              Hostels
            </Link>
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              Explore All Properties
            </Link>
            <Link
              href="/#why-staynest"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
            >
              About StayNest
            </Link>
            <Link
              href="/owner/properties/new"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold transition-colors"
            >
              List Your Property
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
