"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  MapPin,
  X,
  CreditCard,
  Home,
  AlertCircle,
  FileText,
  Utensils,
  Check
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  locality?: string;
  propertyName?: string;
}

interface SearchItem {
  category: "Stay" | "Billing" | "Support" | "Dining" | "Notices";
  title: string;
  subtitle: string;
  href: string;
  icon: any;
}

const SEARCH_ITEMS: SearchItem[] = [
  { category: "Stay", title: "My Room A-101", subtitle: "Bed B1 · Double Sharing (Deluxe)", href: "/dashboard/room", icon: Home },
  { category: "Billing", title: "Monthly Rent Invoice", subtitle: "₹8,950 due on 15th · Pay via UPI/Card", href: "/dashboard/payments", icon: CreditCard },
  { category: "Billing", title: "Security Deposit Receipt", subtitle: "₹15,000 Verified · Download PDF", href: "/dashboard/payments", icon: FileText },
  { category: "Support", title: "Bathroom Tap Leakage", subtitle: "Ticket #TK-104 · In Progress (Plumber)", href: "/dashboard/complaints", icon: AlertCircle },
  { category: "Support", title: "Raise New Ticket", subtitle: "AI-assisted maintenance categorization", href: "/dashboard/complaints", icon: AlertCircle },
  { category: "Dining", title: "Today's Mess Menu", subtitle: "Paneer Butter Masala, Jeera Rice, Gulab Jamun", href: "/dashboard", icon: Utensils },
  { category: "Notices", title: "High-Speed WiFi Upgrade", subtitle: "500 Mbps fiber line now live on Floor 1 & 2", href: "/dashboard/notices", icon: Bell },
  { category: "Notices", title: "Biometric Curfew Guidelines", subtitle: "Late entry pass rules for semester exams", href: "/dashboard/notices", icon: Bell },
];

export default function Header({
  title,
  subtitle = "Your home away from home.",
  locality = "Koramangala, Bengaluru",
  propertyName = "Sunrise Luxury PG"
}: HeaderProps) {
  const router = useRouter();
  const { user, demoLogin } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const roleContainerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
      if (roleContainerRef.current && !roleContainerRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "Resident";
  const displayTitle = title || `${timeGreeting}, ${firstName}`;

  const filteredSearch = searchQuery.trim() === ""
    ? SEARCH_ITEMS.slice(0, 5)
    : SEARCH_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <header className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 pt-1 border-b border-white/5">
      {/* Title & Status Pills */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{displayTitle}</h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            Verified Resident
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs text-slate-400 font-medium">
          <span>{subtitle}</span>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-slate-300">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{propertyName} ({locality})</span>
          </span>
        </div>
      </div>

      {/* Right Controls: Search, Notifications, Persona Switcher */}
      <div className="flex items-center gap-3 self-end md:self-center">
        {/* Global Search with Live Dropdown */}
        <div ref={searchContainerRef} className="relative hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search room, bill, menu, ticket..."
              className="w-64 lg:w-72 pl-10 pr-8 py-2 text-xs rounded-full glass-input placeholder:text-slate-500 text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchFocused && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl glass-search-dropdown p-2 z-50 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{searchQuery ? "Search Results" : "Quick Suggestions"}</span>
                <span className="text-emerald-400 font-normal">Press Enter ↵</span>
              </div>
              <div className="space-y-1 mt-1 max-h-72 overflow-y-auto pr-1">
                {filteredSearch.length > 0 ? (
                  filteredSearch.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          router.push(item.href);
                          setSearchFocused(false);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-white/10 flex items-start gap-3 transition-colors group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                              {item.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 font-mono">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No results for "{searchQuery}". Try searching for "room", "rent", or "menu".
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div ref={notifContainerRef} className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-9 h-9 rounded-full glass-pill flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-500/40 relative cursor-pointer transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2 ring-2 ring-[#0A0F1E] animate-pulse" />
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-search-dropdown p-4 shadow-2xl z-50 text-xs border border-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setUnreadCount(0)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2.5 mt-3 max-h-72 overflow-y-auto pr-1">
                {/* Notification 1 */}
                <Link
                  href="/dashboard/payments"
                  onClick={() => setShowNotif(false)}
                  className="block p-3 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      Rent Invoice Generated
                    </span>
                    <span className="text-[9px] text-slate-500">2h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    September room rent of <span className="text-white font-bold">₹8,950</span> is due by the 15th. Pay now to avoid late fee.
                  </p>
                </Link>

                {/* Notification 2 */}
                <Link
                  href="/dashboard/complaints"
                  onClick={() => setShowNotif(false)}
                  className="block p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Ticket Update #TK-104
                    </span>
                    <span className="text-[9px] text-slate-500">5h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Plumber assigned to tap leakage. Inspection scheduled today between 4:00 PM – 5:30 PM.
                  </p>
                </Link>

                {/* Notification 3 */}
                <Link
                  href="/dashboard/notices"
                  onClick={() => setShowNotif(false)}
                  className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      Hostel Notice
                    </span>
                    <span className="text-[9px] text-slate-500">Yesterday</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Sunday special buffet dinner will be served from 8:00 PM in the central dining hall.
                  </p>
                </Link>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 text-center">
                <Link
                  href="/dashboard/notices"
                  onClick={() => setShowNotif(false)}
                  className="text-[11px] text-emerald-400 hover:underline font-semibold"
                >
                  View all broadcast notices →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User profile & Role switcher */}
        <div ref={roleContainerRef} className="relative flex items-center gap-3 pl-3 border-l border-white/10">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-emerald-500/30 overflow-hidden shrink-0 group-hover:ring-2 group-hover:ring-emerald-400 transition-all shadow-md">
              <img
                src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-white flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                <span>{user?.full_name || "Resident"}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-transform" />
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold tracking-wide">
                {user?.role?.replace("_", " ") || "TENANT"}
              </div>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-12 w-56 rounded-2xl glass-search-dropdown p-2 shadow-2xl z-50 text-xs border border-white/10 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Switch Persona / Portal
              </div>
              <button
                onClick={() => {
                  demoLogin("TENANT");
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                  user?.role === "TENANT" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <span>Tenant (Manas)</span>
                {user?.role === "TENANT" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                onClick={() => {
                  demoLogin("PROPERTY_OWNER");
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                  user?.role === "PROPERTY_OWNER" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <span>Owner (Vikramaditya)</span>
                {user?.role === "PROPERTY_OWNER" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                onClick={() => {
                  demoLogin("WARDEN");
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                  user?.role === "WARDEN" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <span>Warden (Rajesh)</span>
                {user?.role === "WARDEN" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                onClick={() => {
                  demoLogin("SUPER_ADMIN");
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                  user?.role === "SUPER_ADMIN" ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <span>Super Admin</span>
                {user?.role === "SUPER_ADMIN" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
