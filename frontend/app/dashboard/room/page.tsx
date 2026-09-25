"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bed as BedIcon,
  Maximize2,
  Phone,
  DoorOpen,
  Sparkles,
  Wrench,
  Shield,
  ShieldCheck,
  User,
  AlertCircle,
  Clock,
  Compass,
  Wind,
  Bath,
  Tv,
  Wifi,
  Coffee,
  VolumeX,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  FileCheck,
  PhoneCall,
  MessageSquare,
  Calendar,
  Layers,
  KeyRound,
  CheckCircle2,
  Lock,
  Sun,
  Flame,
  Check,
  X,
  Droplets,
  Zap,
  Info
} from "lucide-react";
import Header from "@/components/dashboard/Header";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { BedStatusBadge } from "@/components/bed/BedStatusBadge";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

type ActiveTab = "floorplan" | "inventory" | "climate" | "housekeeping" | "roommates";

interface RoomAsset {
  id: string;
  name: string;
  code: string;
  category: string;
  status: "Verified" | "Operational" | "Inspected";
  description: string;
  icon: any;
}

const SUITE_ASSETS: RoomAsset[] = [
  {
    id: "ast-1",
    name: "Smart RFID Suite Keycard",
    code: "RFID #STAY-9042",
    category: "Access & Security",
    status: "Verified",
    description: "Programmed for turnstile, elevator, and suite smart lock. Master encrypted.",
    icon: KeyRound
  },
  {
    id: "ast-2",
    name: "Personal Wardrobe Locker",
    code: "Locker #101-A",
    category: "Storage",
    status: "Verified",
    description: "Full-height double door steel locker with internal safe and digital lock.",
    icon: Lock
  },
  {
    id: "ast-3",
    name: "Ergonomic Study Station",
    code: "Desk #A-1 + Mesh Chair",
    category: "Work & Study",
    status: "Operational",
    description: "Anti-scratch study table with dual 65W USB-C PD ports and high-back mesh chair.",
    icon: Sliders
  },
  {
    id: "ast-4",
    name: "Orthopedic Spring Mattress",
    code: "Single 78\" × 36\"",
    category: "Bedding",
    status: "Inspected",
    description: "High-density pocket spring mattress with hypoallergenic protector.",
    icon: BedIcon
  },
  {
    id: "ast-5",
    name: "Dual Fast-Charging Hub",
    code: "Port Hub A1",
    category: "Electrical",
    status: "Operational",
    description: "Surge-protected 3-pin AC outlets + USB-A & USB-C fast charging.",
    icon: Zap
  }
];

export default function MyRoomPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("floorplan");
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
  const [cleaningBooked, setCleaningBooked] = useState(false);
  const [swapSubmitted, setSwapSubmitted] = useState(false);
  const [selectedSwapBed, setSelectedSwapBed] = useState("Bed C");
  const [swapReason, setSwapReason] = useState("");

  const { data: roomData, isLoading } = useQuery({
    queryKey: ["my-room"],
    queryFn: () => api.allocations.getMyRoom(),
  });

  if (isLoading) {
    return <LoadingState message="Loading room and floorplan blueprint..." />;
  }

  if (!roomData?.is_allocated) {
    return (
      <EmptyState
        icon={BedIcon}
        title="No Active Bed Allocation"
        description="You do not have an active bed allocation assigned to your account. Browse our property catalog to find available rooms and beds."
        action={
          <Link
            href="/properties"
            className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 inline-block"
          >
            Explore Verified Stays
          </Link>
        }
      />
    );
  }

  const roomBeds = roomData.room?.beds || [];
  const roommates = roomData.roommates || [];
  const roomNumber = roomData.room?.number || "A-101";
  const myBedCode = roomData.my_bed?.code || "Bed A";
  const capacity = roomData.room?.capacity || 4;
  const occupiedCount = roomBeds.filter((b) => b.status === "OCCUPIED").length || 3;

  const handleBookCleaning = () => {
    setCleaningBooked(true);
    setTimeout(() => {
      setIsCleaningModalOpen(false);
      setCleaningBooked(false);
    }, 2000);
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSwapSubmitted(true);
    setTimeout(() => {
      setIsSwapModalOpen(false);
      setSwapSubmitted(false);
      setSwapReason("");
    }, 2200);
  };

  return (
    <div className="space-y-7">
      <Header
        title={`Suite ${roomNumber} Living Space`}
        subtitle="Architectural 2D layout, assigned inventory assets, and climate controls."
        locality={roomData.property?.locality ? `${roomData.property.locality}, ${roomData.property.city || "Bengaluru"}` : "Koramangala, Bengaluru"}
        propertyName={roomData.property?.name || "Sunrise Luxury PG"}
      />

      {/* ── Top Executive Overview Strip ── */}
      <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-white/10 relative overflow-hidden shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                {roomData.building || "Block A"} · {roomData.floor || "Floor 1"} · Suite {roomNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                {capacity}-Sharing Executive Suite
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Executive Suite {roomNumber}
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Your Bed: {myBedCode} (Window Side)</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
              <span>{roomData.property?.name || "Sunrise Luxury PG"}</span>
              <span className="text-slate-600">•</span>
              <span>{roomData.property?.locality || "Koramangala"}, {roomData.property?.city || "Bengaluru"}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">Check-in: {roomData.check_in_date || "2026-08-01"}</span>
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsSwapModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Request Bed Swap</span>
            </button>

            <button
              onClick={() => setIsCleaningModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Request Cleaning</span>
            </button>

            <Link
              href="/dashboard/complaints"
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 hover:scale-105"
            >
              <Wrench className="w-3.5 h-3.5 fill-current" />
              <span>Report Issue</span>
            </Link>
          </div>
        </div>

        {/* 4 Compact Suite KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Monthly Rent</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">
              {formatCurrency(roomData.monthly_rent || 8000)}
            </div>
            <div className="text-[10px] text-slate-400 truncate">All-inclusive utilities</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Occupancy</div>
            <div className="text-lg font-black text-white mt-0.5">
              {occupiedCount} / {capacity} Beds
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold truncate">
              {capacity - occupiedCount > 0 ? `${capacity - occupiedCount} Bed Available` : "Full Suite"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Suite Area</div>
            <div className="text-lg font-black text-white mt-0.5">
              384 sq.ft
            </div>
            <div className="text-[10px] text-slate-400 truncate">Balcony + Bath attached</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Deep Cleaning</div>
            <div className="text-lg font-black text-white mt-0.5">
              Tomorrow
            </div>
            <div className="text-[10px] text-amber-400 font-semibold truncate">10:30 AM – 12:00 PM</div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 overflow-x-auto">
        <button
          onClick={() => setActiveTab("floorplan")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "floorplan"
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Maximize2 className={`w-3.5 h-3.5 ${activeTab === "floorplan" ? "text-emerald-400" : "text-slate-500"}`} />
          <span>Floorplan Blueprint & Beds</span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "inventory"
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className={`w-3.5 h-3.5 ${activeTab === "inventory" ? "text-emerald-400" : "text-slate-500"}`} />
          <span>Inventory & Assigned Assets</span>
        </button>

        <button
          onClick={() => setActiveTab("climate")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "climate"
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Wind className={`w-3.5 h-3.5 ${activeTab === "climate" ? "text-emerald-400" : "text-slate-500"}`} />
          <span>Climate & Utilities</span>
        </button>

        <button
          onClick={() => setActiveTab("housekeeping")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "housekeeping"
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeTab === "housekeeping" ? "text-emerald-400" : "text-slate-500"}`} />
          <span>Housekeeping Log</span>
        </button>

        <button
          onClick={() => setActiveTab("roommates")}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === "roommates"
              ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <User className={`w-3.5 h-3.5 ${activeTab === "roommates" ? "text-emerald-400" : "text-slate-500"}`} />
          <span>Roommates ({roommates.length})</span>
        </button>
      </div>

      {/* ── TAB 1: Architectural 2D Blueprint & Bed Layout ── */}
      {activeTab === "floorplan" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl">
            {/* Blueprint Header with Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-emerald-400" />
                  <span>CAD Architectural Blueprint — Suite {roomNumber}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dimensions: 24' 0" × 16' 0" · Floor 1 East Wing · Acoustic Partition Walls
                </p>
              </div>

              {/* Status legend */}
              <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Available</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>Occupied</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Maintenance</span>
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Reserved</span>
                </span>
              </div>
            </div>

            {/* 2D Floorplan CAD Canvas */}
            <div className="relative rounded-3xl border border-white/15 bg-[#070B14] p-5 sm:p-8 space-y-6 overflow-hidden shadow-inner bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px]">
              {/* Compass & Scale Indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>NORTH-EAST FACING</span>
                </div>
                <div>SCALE 1:50 · HIGH ACCURACY</div>
              </div>

              {/* Top Zone: Balcony & Sunlit Window Wall */}
              <div className="relative p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-center flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>East-Facing Sliding French Windows & Balcony</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30">
                  NATURAL DAYLIGHT BAY
                </span>
              </div>

              {/* Dynamic Beds Layout Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
                {roomBeds.map((bed) => {
                  const isMine = bed.is_current_user;
                  const isAvailable = bed.status === "AVAILABLE";
                  const isOccupied = bed.status === "OCCUPIED";

                  return (
                    <div
                      key={bed.bed_id}
                      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative ${
                        isMine
                          ? "bg-emerald-500/[0.08] border-emerald-500/60 shadow-lg shadow-emerald-500/10"
                          : isAvailable
                          ? "bg-emerald-500/[0.02] border-dashed border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/[0.05]"
                          : isOccupied
                          ? "bg-white/[0.03] border-white/10 hover:border-white/20"
                          : "bg-amber-500/[0.03] border-amber-500/30"
                      }`}
                    >
                      {/* Bed Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isMine
                                ? "bg-emerald-500 text-slate-950"
                                : isAvailable
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-white/5 text-slate-300"
                            }`}
                          >
                            <BedIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-black tracking-wider text-white">
                              {bed.bed_code}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {bed.bed_code.includes("A") || bed.bed_code.includes("C") ? "Window Side" : "Aisle Side"}
                            </div>
                          </div>
                        </div>

                        {isMine ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 shadow-md">
                            YOUR ALLOCATED BED
                          </span>
                        ) : (
                          <BedStatusBadge status={bed.status} size="sm" />
                        )}
                      </div>

                      {/* Resident / Vacancy Details */}
                      <div className="py-4">
                        {bed.occupant ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={bed.occupant.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                              alt={bed.occupant.name}
                              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                <span>{isMine ? `${bed.occupant.name} (You)` : bed.occupant.name}</span>
                                {isMine && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">{bed.occupant.email}</div>
                              <div className="text-[10px] text-emerald-400/90 font-medium mt-0.5">
                                Verified Tenant · KYC Approved
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                              {isAvailable ? <Sparkles className="w-5 h-5" /> : <Wrench className="w-5 h-5 text-amber-400" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">
                                {isAvailable ? "Open for Co-Living Allocation" : "Bed Maintenance"}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {isAvailable ? "Ready for immediate move-in" : "Inspection scheduled"}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bed Footer & Action */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Monthly Living Rate</span>
                          <span className="text-emerald-300 font-bold">{formatCurrency(bed.monthly_rent)}/mo</span>
                        </div>

                        {isMine ? (
                          <button
                            onClick={() => setIsSwapModalOpen(true)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer border border-emerald-500/30"
                          >
                            Swap Bed
                          </button>
                        ) : isAvailable ? (
                          <button
                            onClick={() => {
                              setSelectedSwapBed(bed.bed_code);
                              setIsSwapModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Select Bed
                          </button>
                        ) : (
                          bed.occupant?.phone && (
                            <a
                              href={`tel:${bed.occupant.phone}`}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Contact</span>
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Central Study Aisle Marker */}
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-wrap gap-2">
                <span className="text-slate-300 font-bold">[ CENTRAL ERGONOMIC STUDY AISLE ]</span>
                <span>• 4 Dedicated Desks</span>
                <span>• High-Speed LAN Nodes</span>
                <span>• Acoustic Flooring</span>
              </div>

              {/* Bottom Wall: Attached Washroom & Suite Main Entry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Attached Bath */}
                <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-purple-300">
                    <Bath className="w-4 h-4 text-purple-400" />
                    <span>Attached Luxury Bathroom</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                    HOT GEYSER ACTIVE
                  </span>
                </div>

                {/* Main Door */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-300">
                    <DoorOpen className="w-4 h-4 text-emerald-400" />
                    <span>Main Acoustic Entryway Door</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    SMART RFID ACCESS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Suite Inventory & Assigned Physical Assets ── */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Assigned Resident Asset Inventory</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Physical amenities verified and allocated specifically to your bed ({myBedCode}).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>5 / 5 Assets Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SUITE_ASSETS.map((asset) => {
                const Icon = asset.icon;
                return (
                  <div
                    key={asset.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {asset.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-3 group-hover:text-emerald-300 transition-colors">
                        {asset.name}
                      </h3>
                      <div className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
                        {asset.code}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {asset.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Category: {asset.category}</span>
                      <span className="text-emerald-400">Active</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inventory Sign-off Notice */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs text-emerald-200">
                  All room assets were inspected and accepted during check-in on <span className="font-bold text-white">{roomData.check_in_date || "2026-08-01"}</span>.
                </div>
              </div>
              <Link
                href="/dashboard/complaints"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                Report Damaged Asset →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Climate & Utilities ── */}
      {activeTab === "climate" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl">
            <div className="pb-2 border-b border-white/5">
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-400" />
                <span>Suite Environmental Telemetry & Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time status of air conditioning, water pressure, fiber wifi node, and power sync.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Climate 1: Air Conditioning */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Climate</span>
                  <Wind className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-white">24°C Active</div>
                <div className="text-xs text-cyan-300 font-semibold">Dual Inverter AC</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Eco cooling preset active. Remote kept at Study Desk A. Cleaned 10 days ago.
                </p>
              </div>

              {/* Climate 2: Hot Water Geyser */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Water Supply</span>
                  <Droplets className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">24/7 Geyser</div>
                <div className="text-xs text-purple-300 font-semibold">Pressure 2.5 Bar</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Attached bathroom instant heating. Pure soft water supply with zero scale.
                </p>
              </div>

              {/* Climate 3: Room Mesh WiFi */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Dedicated Node</span>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">500 Mbps</div>
                <div className="text-xs text-emerald-300 font-semibold">Ping 7ms · Zero Jitter</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Floor 1 East Wing dedicated mesh access point. WPA3 security protocol.
                </p>
              </div>

              {/* Climate 4: Power Backup */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Power Backup</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">100% DG Sync</div>
                <div className="text-xs text-amber-300 font-semibold">Zero-Break UPS</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Automatic generator changeover under 3 seconds. Study desks connected to UPS.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Housekeeping & Cleaning Log ── */}
      {activeTab === "housekeeping" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Suite Housekeeping & Sanitization Log</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scheduled bi-weekly linen change, floor scrubbing, and washroom sanitization.
                </p>
              </div>

              <button
                onClick={() => setIsCleaningModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer self-start sm:self-center"
              >
                + Request On-Demand Cleaning
              </button>
            </div>

            {/* Next Service Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next Scheduled Clean</span>
                </div>
                <div className="text-lg font-black text-white">Tomorrow, 10:30 AM – 12:00 PM</div>
                <div className="text-xs text-slate-300">
                  Included: Linen replacement, washroom deep sanitization, vacuum & dustbin clear.
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-white border border-white/10 self-start sm:self-center">
                Staff Assigned: Sunita R.
              </div>
            </div>

            {/* Past Cleaning History */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Service History</div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Full Suite Deep Clean & Linen Refresh</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Yesterday at 11:45 AM · Staff Sunita R.</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Completed (★ 5.0)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Washroom Sanitization & AC Filter Clean</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">4 days ago at 10:15 AM · Staff Rajesh K.</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Completed (★ 4.9)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Roommates & Community Rules ── */}
      {activeTab === "roommates" && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Co-Living Residents in Suite {roomNumber} ({roommates.length})</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct contacts and verified profiles of fellow suite occupants.
                </p>
              </div>

              <Link
                href="/dashboard/roommates"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
              >
                <span>Compatibility Matrix</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {roommates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roommates.map((mate) => (
                  <div
                    key={mate.id}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={mate.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                        alt={mate.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{mate.name}</div>
                        <div className="text-xs text-slate-400 truncate">{mate.email}</div>
                        <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                          Verified Suite Co-Resident
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {mate.phone && (
                        <a
                          href={`tel:${mate.phone}`}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-all shadow-sm"
                          title="Call Roommate"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link
                        href="/dashboard/roommates"
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-bold transition-all shadow-sm"
                        title="View Full Profile"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
                You are currently the sole active resident in this suite. Other beds are open for booking.
              </div>
            )}

            {/* Suite Co-Living Charter */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Suite Code of Conduct
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Quiet Hours</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">10:30 PM – 7:00 AM (Headphones mandatory)</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="font-bold text-cyan-400 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />
                    <span>AC Agreement</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Default 24°C consensus during night hours</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="font-bold text-purple-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Visitor Curfew</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Day guests allowed till 8:00 PM in lounge</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: Request Bed Swap ── */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Request Bed or Suite Swap"
        description="Submit a preference request to swap your allocated bed with another in this suite or upgrade to a private room."
      >
        {swapSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-white">Swap Request Submitted!</h4>
            <p className="text-xs text-slate-400">
              Your request for <span className="text-emerald-400 font-bold">{selectedSwapBed}</span> has been routed to Warden Rajesh. You will receive an update in notices within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSwapSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Current Bed Allocation
              </label>
              <input
                type="text"
                disabled
                value={`Suite ${roomNumber} · ${myBedCode} (₹8,000/mo)`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Target Bed or Upgrade Preference
              </label>
              <select
                value={selectedSwapBed}
                onChange={(e) => setSelectedSwapBed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B101E] border border-white/15 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Bed C">Suite A-101 · Bed C (Available · Window Side)</option>
                <option value="Bed B">Suite A-101 · Bed B (Occupancy Mutual Swap)</option>
                <option value="Private Single Room">Upgrade to Private Single Suite (Floor 2)</option>
                <option value="Double Sharing Deluxe">Transfer to Double Sharing Deluxe (Tower B)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Reason for Swap Request
              </label>
              <textarea
                required
                rows={3}
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                placeholder="e.g., Preference for window daylight, exam study schedule alignment..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B101E] border border-white/15 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSwapModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-500/20"
              >
                Submit Request
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL 2: Request Priority Cleaning ── */}
      <Modal
        isOpen={isCleaningModalOpen}
        onClose={() => setIsCleaningModalOpen(false)}
        title="Request Priority Room Cleaning"
        description="Book on-demand housekeeping service for suite sanitization or linen change."
      >
        {cleaningBooked ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-base font-bold text-white">Housekeeping Booked!</h4>
            <p className="text-xs text-slate-400">
              Staff Sunita has been notified for Suite {roomNumber}. Cleaning scheduled within 90 minutes.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                <span className="font-bold text-white">Included Services:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400">
                  <li>Floor vacuuming and antimicrobial mopping</li>
                  <li>Attached bathroom deep wash & geyser check</li>
                  <li>Trash bin sanitation & fresh liners</li>
                  <li>Study desk dust wipe & air purification</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Preferred Time Slot
              </label>
              <select className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B101E] border border-white/15 text-xs text-white focus:border-emerald-500 focus:outline-none">
                <option>Today: Afternoon Slot (2:00 PM – 3:30 PM)</option>
                <option>Today: Evening Slot (5:30 PM – 6:30 PM)</option>
                <option>Tomorrow: Morning Slot (9:00 AM – 10:30 AM)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCleaningModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBookCleaning}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-500/20"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
