"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  CreditCard,
  AlertCircle,
  Bell,
  ArrowRight,
  Users,
  CheckCircle2,
  PhoneCall,
  FileText,
  Wifi,
  Copy,
  Check,
  Utensils,
  Clock,
  Coffee,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
  Zap,
  Sparkles,
  Droplets,
  Shirt,
  Flame,
  ArrowUpRight
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

// ── Mess Schedule Types & Data ──
type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

interface MealInfo {
  id: MealType;
  name: string;
  time: string;
  icon: any;
  dishes: string[];
  dietTags: string[];
  special: string;
  calories: string;
}

const MESS_SCHEDULE: MealInfo[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    time: "7:30 AM – 10:00 AM",
    icon: Coffee,
    dishes: [
      "Crispy Masala Dosa",
      "Steamed Idlis & Vada",
      "Traditional Drumstick Sambar",
      "Coconut & Tomato Chutney",
      "Fresh Filter Coffee / Masala Chai"
    ],
    dietTags: ["🌱 100% Veg", "Freshly Cooked"],
    special: "Chef's Choice: Ghee Roast with Gunpowder Podi",
    calories: "~480 kcal"
  },
  {
    id: "lunch",
    name: "Lunch",
    time: "12:30 PM – 3:00 PM",
    icon: Sun,
    dishes: [
      "Shahi Paneer Butter Masala",
      "Slow-Cooked Dal Makhani",
      "Steamed Long-Grain Basmati Rice",
      "Fresh Phulkas / Butter Tandoori Roti",
      "Cucumber Boondi Raita & Salad",
      "Warm Gulab Jamun (Dessert)"
    ],
    dietTags: ["🌱 High Protein", "Chef Special"],
    special: "North-South Thali with Unlimited Servings",
    calories: "~720 kcal"
  },
  {
    id: "snacks",
    name: "Evening High-Tea",
    time: "5:00 PM – 6:30 PM",
    icon: Sunset,
    dishes: [
      "Golden Crispy Onion Pakodas",
      "Crispy Vegetable Cutlets",
      "Green Mint & Tamarind Chutney",
      "Hot Masala Ginger Tea / Bru Coffee"
    ],
    dietTags: ["☕ Tea-Time Favorite", "Hot & Crispy"],
    special: "Rainy Evening Fresh Fritters & Cookies",
    calories: "~340 kcal"
  },
  {
    id: "dinner",
    name: "Dinner",
    time: "8:00 PM – 10:30 PM",
    icon: Moon,
    dishes: [
      "Paneer Kadhai / Egg Curry (Special Option)",
      "Yellow Dal Tadka with Desi Ghee",
      "Fragrant Jeera Pulao",
      "Warm Multigrain Rotis",
      "Fresh Green Salad & Curd",
      "Chilled Fruit Custard"
    ],
    dietTags: ["🌱 / 🥚 Balanced Nutrition", "Light Meal"],
    special: "Choice of Paneer Kadhai or Spiced Egg Curry",
    calories: "~620 kcal"
  }
];

export default function TenantDashboard() {
  const { user } = useAuth();
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [activeMeal, setActiveMeal] = useState<MealType>("lunch");

  // Determine current meal automatically by local hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) {
      setActiveMeal("breakfast");
    } else if (hour >= 11 && hour < 16) {
      setActiveMeal("lunch");
    } else if (hour >= 16 && hour < 19) {
      setActiveMeal("snacks");
    } else {
      setActiveMeal("dinner");
    }
  }, []);

  // Fetch live tenant data from backend
  const { data: roomData } = useQuery({
    queryKey: ["my-room"],
    queryFn: () => api.allocations.getMyRoom(),
    enabled: !!user,
  });

  const { data: paymentSummary } = useQuery({
    queryKey: ["payment-summary"],
    queryFn: () => api.payments.getSummary(),
    enabled: !!user,
  });

  const { data: complaints } = useQuery({
    queryKey: ["complaints"],
    queryFn: () => api.complaints.getAll(),
    enabled: !!user,
  });

  const { data: notices } = useQuery({
    queryKey: ["notices"],
    queryFn: () => api.notices.getAll(),
    enabled: !!user,
  });

  const { data: roommateMatches } = useQuery({
    queryKey: ["roommate-matches"],
    queryFn: () => api.roommates.getMatches(),
    enabled: !!user,
    retry: false,
  });

  const pendingComplaints = complaints?.filter((c) => c.status !== "RESOLVED") || [];
  const nextDue = paymentSummary?.next_due_amount || 8950;
  const isPaymentPending = (paymentSummary?.total_pending || 0) > 0 || nextDue > 0;
  const roommateCount = roomData?.roommates?.length || 2;

  const handleCopyWifi = () => {
    navigator.clipboard.writeText("StayNest#Bengaluru2026");
    setCopiedWifi(true);
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  const currentMealData = MESS_SCHEDULE.find((m) => m.id === activeMeal) || MESS_SCHEDULE[1];

  // Fallback roommate matches for premier resident experience
  const displayRoommates = (roommateMatches && roommateMatches.length > 0)
    ? roommateMatches.slice(0, 2)
    : [
        {
          tenant_id: "demo-rm-1",
          full_name: "Rohan Sharma",
          course: "B.Tech Computer Science",
          year_of_study: 3,
          overall_compatibility: 96,
          match_tag: "High Compatibility",
          bed_code: "Bed B2",
          room_number: "A-101",
          bio: "Software intern at tech park. Loves quiet night study sessions and weekend football.",
          hobbies: "Coding, Chess, Football",
          avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
        },
        {
          tenant_id: "demo-rm-2",
          full_name: "Aditya Patel",
          course: "MBA FinTech",
          year_of_study: 1,
          overall_compatibility: 91,
          match_tag: "Lifestyle Match",
          bed_code: "Bed B3",
          room_number: "A-101",
          bio: "Morning gym enthusiast, vegetarian, tidy & organized living space.",
          hobbies: "Gym, Reading, Finance",
          avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        }
      ];

  return (
    <div className="space-y-8">
      {/* Top Header with Live Verified Resident Status */}
      <Header
        title={`Welcome back, ${user?.full_name?.split(" ")[0] || "Resident"}`}
        subtitle="Manage your room, payments, dining schedule, and resident access."
        locality={roomData?.property?.locality || "Koramangala, Bengaluru"}
        propertyName={roomData?.property?.name || "Sunrise Luxury PG"}
      />

      {/* ── 5 Enhanced Luxury Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Current Stay */}
        <div className="p-5 rounded-3xl glass-card dashboard-card-hover border border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Allocated Stay</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Home className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {roomData?.room?.number ? `Room ${roomData.room.number}` : "Room A-101"}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <span>{roomData?.building || "Main Block"} · {roomData?.my_bed?.code || "Bed B1"}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Deluxe AC Double</span>
            <Link
              href="/dashboard/room"
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
            >
              <span>Floorplan</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 2. Next Rent */}
        <div className="p-5 rounded-3xl glass-card dashboard-card-hover border border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Next Due Rent</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {formatCurrency(nextDue)}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                Due: <span className="text-white font-semibold">{paymentSummary?.next_due_date || "15 Sep 2026"}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-amber-400 font-medium">Auto-invoice</span>
            <Link
              href="/dashboard/payments"
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Pay Now</span>
            </Link>
          </div>
        </div>

        {/* 3. Payment Status */}
        <div className="p-5 rounded-3xl glass-card dashboard-card-hover border border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Account Health</span>
              <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPaymentPending ? "bg-amber-400 animate-pulse shadow-sm shadow-amber-400" : "bg-emerald-400 shadow-sm shadow-emerald-400"
                  }`}
                />
                <span>{isPaymentPending ? "Payment Due" : "Settled"}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                {isPaymentPending ? "September Bill Ready" : "All Past Dues Cleared"}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Zero Arrears</span>
            <Link
              href="/dashboard/payments"
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>History</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 4. Active Support Tickets */}
        <div className="p-5 rounded-3xl glass-card dashboard-card-hover border border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Support Tickets</span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {pendingComplaints.length > 0 ? `${pendingComplaints.length} Open` : "0 Open"}
              </div>
              <div className="text-xs text-amber-400/90 font-medium mt-0.5">
                {pendingComplaints.length > 0 ? "Under Triage & Assignment" : "All Facilities Normal"}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">AI Priority</span>
            <Link
              href="/dashboard/complaints"
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>+ Raise Ticket</span>
            </Link>
          </div>
        </div>

        {/* 5. Circulars & Bulletins */}
        <div className="p-5 rounded-3xl glass-card dashboard-card-hover border border-white/5 flex flex-col justify-between relative overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Hostel Circulars</span>
              <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white tracking-tight">
                {notices?.length || 3}
              </div>
              <div className="text-xs text-blue-400/90 font-medium mt-0.5">
                Official Updates Active
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">3 Unread</span>
            <Link
              href="/dashboard/notices"
              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Read All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Section: Today's Dining Schedule (Live Mess Menu) ── */}
      <section className="p-6 sm:p-7 rounded-3xl glass-panel space-y-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Today's Dining Schedule
                </h2>
                <span className="badge-live">
                  Live Mess Menu
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Central Dining Hall · Ground Floor · Hygenic FSSAI Certified Kitchen
              </p>
            </div>
          </div>

          {/* Quick Dietary Filters */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              🌱 Veg Spread Included
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              ⚡ Warm Serving
            </span>
          </div>
        </div>

        {/* Meal Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5">
          {MESS_SCHEDULE.map((meal) => {
            const Icon = meal.icon;
            const isSelected = activeMeal === meal.id;
            return (
              <button
                key={meal.id}
                onClick={() => setActiveMeal(meal.id)}
                className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                <div className="text-left">
                  <div className="leading-tight">{meal.name}</div>
                  <div className="text-[9px] font-normal opacity-70 hidden sm:block">{meal.time.split("–")[0]}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Meal Display Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
          {/* Left 2 Cols: Dishes List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">
                  Serving Hours: <span className="text-white">{currentMealData.time}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {currentMealData.calories}
                </span>
              </div>
            </div>

            {/* Dish Pills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentMealData.dishes.map((dish, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-emerald-500/30 transition-all flex items-center gap-3 group"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                    {dish}
                  </span>
                </div>
              ))}
            </div>

            {/* Chef Highlight Callout */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-500/20 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-xs text-amber-200/90 font-medium leading-relaxed">
                <span className="font-bold text-amber-300">Today's Highlight: </span>
                {currentMealData.special}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Dining Info & Guidelines */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dining Hall Guidelines
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Unlimited buffet with pure mineral drinking water.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Biometric resident meal pass scan at counter.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Special dietary requests accommodated via Warden office.</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Food Quality Rating: <span className="text-amber-400 font-bold">★ 4.8</span></span>
              <a
                href="#quick-actions"
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                Feedback →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Digital Living & WiFi Access Hub ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Speed WiFi Access Hub */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl glass-panel space-y-5 border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  High-Speed 5G Resident WiFi
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ultra-low latency dedicated resident fiber connection (Floor 1 & 2)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                500 Mbps Fiber
              </span>
            </div>
          </div>

          {/* Credentials Bar with 1-Click Copy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* SSID */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Network SSID</div>
                <div className="text-sm font-black text-white mt-1 font-mono tracking-wide">
                  StayNest_5G_Resident
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                WPA3 Secure
              </span>
            </div>

            {/* Password with 1-Click Copy */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Password</div>
                <div className="text-sm font-black text-white mt-1 font-mono tracking-wide">
                  StayNest#Bengaluru2026
                </div>
              </div>
              <button
                onClick={handleCopyWifi}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 hover:scale-105 cursor-pointer"
                title="Copy Password"
              >
                {copiedWifi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-950" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Facilities Health Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-slate-300">RO Drinking Water</div>
              <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">24/7 Active</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <Shirt className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-slate-300">Smart Laundry</div>
              <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">3 Washers Free</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-slate-300">Power Backup</div>
              <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">100% DG Sync</div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Smart Curfew & Security Gate Status */}
        <div className="p-6 sm:p-7 rounded-3xl glass-panel flex flex-col justify-between space-y-4 border border-white/10">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Security & Gate Pass</h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white/[0.04] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Night Curfew:</span>
                <span className="text-white font-bold">11:30 PM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Biometric Gate:</span>
                <span className="text-emerald-400 font-bold">● Entry Open</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Security Desk:</span>
                <span className="text-slate-300 font-medium">Main Entrance</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              For late entry past 11:30 PM (e.g. project submission or train arrival), submit an online pass request to the warden 3 hours in advance.
            </p>
          </div>

          <a
            href={`tel:${roomData?.property?.contact_phone || "+919876511111"}`}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-bold text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Emergency Gate Helpline</span>
          </a>
        </div>
      </div>

      {/* ── Section: Notices & Room/Roommate Snapshot ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Notices & Announcements Feed */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl glass-panel space-y-5 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">Recent Notices & Circulars</h2>
                <p className="text-[11px] text-slate-400">Hostel administration broadcast messages</p>
              </div>
            </div>
            <Link
              href="/dashboard/notices"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>View all circulars</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {notices && notices.length > 0 ? (
              notices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3.5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {notice.title}
                      </span>
                      {notice.is_pinned && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          📌 Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {notice.description}
                    </p>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono flex items-center gap-2">
                      <span>Published: {formatDate(notice.created_at)}</span>
                      <span>·</span>
                      <span className="text-emerald-400/80">Active Bulletin</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 p-6 text-center bg-white/[0.02] rounded-2xl">
                No recent announcements available.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Your Room & Roommates Snapshot */}
        <div className="p-6 sm:p-7 rounded-3xl glass-panel flex flex-col justify-between space-y-5 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">Your Room & Bed</h2>
            </div>
            <Link
              href="/dashboard/room"
              className="text-xs text-emerald-400 flex items-center gap-1 hover:underline font-semibold"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Room Photo Banner */}
          <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group">
            <img
              src={roomData?.room?.image_url || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600"}
              alt="Room"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090D14] via-[#090D14]/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
              <div className="font-bold drop-shadow">
                {roomData?.room?.number ? `Room ${roomData.room.number}` : "Room A-101"} · {roomData?.building || "Main Tower"}
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow-md">
                {roomData?.my_bed?.code || "Bed B1 Allocated"}
              </span>
            </div>
          </div>

          {/* Roommates Compatibility Snapshot */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Roommates ({roommateCount})
              </span>
              <Link
                href="/dashboard/roommates"
                className="text-[11px] font-semibold text-emerald-400 hover:underline"
              >
                Match Scores →
              </Link>
            </div>

            <div className="space-y-2">
              {displayRoommates.map((rm, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={rm.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={rm.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{rm.full_name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{rm.course}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {rm.overall_compatibility}%
                    </span>
                    <Link
                      href="/dashboard/roommates"
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="View Profile"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: Quick Actions Bar (6 Luxury Actionable Tiles) ── */}
      <section id="quick-actions" className="p-6 sm:p-7 rounded-3xl glass-panel space-y-4 border border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Resident Quick Actions
          </h2>
          <span className="text-[11px] text-emerald-400/90 font-medium">1-Click Direct Access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Action 1 */}
          <Link
            href="/dashboard/payments"
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-emerald-500/15 hover:border-emerald-500/40 border border-white/5 text-left transition-all flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-emerald-300">Pay Rent</span>
              <span className="text-[10px] text-slate-400">UPI & Card</span>
            </div>
          </Link>

          {/* Action 2 */}
          <Link
            href="/dashboard/complaints"
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-amber-500/15 hover:border-amber-500/40 border border-white/5 text-left transition-all flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-amber-300">Report Issue</span>
              <span className="text-[10px] text-slate-400">AI Triage</span>
            </div>
          </Link>

          {/* Action 3 */}
          <button
            onClick={handleCopyWifi}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-teal-500/15 hover:border-teal-500/40 border border-white/5 text-left transition-all flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-teal-300">
                {copiedWifi ? "Password Copied!" : "WiFi Password"}
              </span>
              <span className="text-[10px] text-slate-400">500 Mbps</span>
            </div>
          </button>

          {/* Action 4 */}
          <Link
            href="/dashboard/roommates"
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-purple-500/15 hover:border-purple-500/40 border border-white/5 text-left transition-all flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-purple-300">Roommates</span>
              <span className="text-[10px] text-slate-400">Compatibility</span>
            </div>
          </Link>

          {/* Action 5 */}
          <Link
            href="/dashboard/documents"
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-blue-500/15 hover:border-blue-500/40 border border-white/5 text-left transition-all flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-blue-300">KYC Docs</span>
              <span className="text-[10px] text-slate-400">Lease Agreement</span>
            </div>
          </Link>

          {/* Action 6 */}
          <a
            href={`tel:${roomData?.property?.contact_phone || "+919876511111"}`}
            className="p-4 rounded-2xl bg-white/[0.04] hover:bg-rose-500/15 hover:border-rose-500/40 border border-white/5 text-left transition-all flex flex-col justify-between h-28 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500/20 transition-all">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block group-hover:text-rose-300">Helpline</span>
              <span className="text-[10px] text-slate-400">24/7 Warden</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
