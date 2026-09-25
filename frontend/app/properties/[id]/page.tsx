"use client";

import { use } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  Wifi,
  Utensils,
  Wind,
  Shield,
  Zap,
  Phone,
  Check,
  Calendar,
  Users,
  Building,
  BedDouble,
  ArrowLeft,
  Coffee,
  CheckCircle2,
  Lock,
  Sparkles,
  Info
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { Property, Bed } from "@/types";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "amenities" | "reviews" | "location">("overview");
  const [selectedBed, setSelectedBed] = useState<{
    id: string;
    code: string;
    roomNumber: string;
    rent: number;
  } | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["property", resolvedParams.id],
    queryFn: () => api.properties.getById(resolvedParams.id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D14] flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 w-full animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-xl bg-white/5" />
          <div className="h-96 rounded-3xl bg-white/5" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 h-64 rounded-3xl bg-white/5" />
            <div className="h-64 rounded-3xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#090D14] flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto my-auto p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Property Not Found</h2>
          <p className="text-xs text-slate-400">The property you requested does not exist or has been removed.</p>
          <Link href="/properties" className="px-5 py-2.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs inline-block">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const allRooms = property.buildings?.flatMap((b) => b.floors?.flatMap((f) => f.rooms)) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#090D14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all stays</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Property ID:</span>
            <span className="text-xs font-mono text-slate-400">{property.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* Title Header with Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {property.name}
              </h1>
              {property.is_verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified StayNest Property</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{property.address || `${property.locality}, ${property.city}`}</span>
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">{property.rating || "4.8"}</span>
                <span>({property.total_reviews || 84} reviews)</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                {property.property_type === "PG" ? "Co-Living PG" : "Hostel"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              aria-label="Save Property"
              className={`w-10 h-10 rounded-full glass-pill flex items-center justify-center transition-all ${
                isFavorite ? "text-rose-400 bg-rose-500/20 border-rose-500/30" : "text-slate-300 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Architectural Image Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="md:col-span-2 h-[340px] sm:h-[460px] bg-slate-900 overflow-hidden relative group">
            <img
              src={property.cover_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"}
              alt={property.name}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-[#090D14]/80 backdrop-blur-md text-emerald-300 border border-white/10">
              Primary Residence
            </div>
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4 h-[460px]">
            <div className="bg-slate-900 overflow-hidden relative group">
              <img
                src={property.images_json?.[1] || "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"}
                alt="Room interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#090D14]/70 backdrop-blur-md text-white border border-white/10">
                Furnished Bed & Desk
              </div>
            </div>
            <div className="bg-slate-900 overflow-hidden relative group">
              <img
                src={property.images_json?.[2] || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"}
                alt="Dining lounge"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#090D14]/70 backdrop-blur-md text-white border border-white/10">
                Community Dining
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-white/10 flex items-center gap-8 text-xs sm:text-sm font-semibold overflow-x-auto">
          {(["overview", "rooms", "amenities", "reviews", "location"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 capitalize transition-colors relative whitespace-nowrap ${
                activeTab === tab ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>{tab === "rooms" ? "Rooms & Beds" : tab}</span>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50" />
              )}
            </button>
          ))}
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details & Interactive Bed Map */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Property */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">About this stay</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {property.description ||
                  "StayNest verified residence offering high-speed fiber internet, nutritious home-cooked meals, daily housekeeping, 24/7 security with CCTV, and intelligent roommate matching in the heart of Bengaluru."}
              </p>
            </div>

            {/* Room & Interactive Bed Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Select Your Bed</h2>
                  <p className="text-xs text-slate-400">Click an available bed to preview rent and reserve.</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-700" /> Occupied
                  </span>
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-emerald-500" /> Selected
                  </span>
                </div>
              </div>

              {allRooms.length > 0 ? (
                <div className="space-y-4">
                  {allRooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-5 sm:p-6 rounded-3xl glass-card space-y-4 border border-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-base font-bold text-white">Room {room.room_number}</div>
                          <div className="text-xs text-slate-400 capitalize">
                            {room.room_type.toLowerCase().replace("_", " ")} Sharing · Capacity {room.capacity} Beds
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-emerald-400">₹{room.base_rent?.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400">base rent / bed</div>
                        </div>
                      </div>

                      {/* Interactive Bed Selector Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {room.beds.map((bed) => {
                          const isOccupied = bed.status === "OCCUPIED";
                          const isSelected = selectedBed?.id === bed.id;

                          return (
                            <button
                              key={bed.id}
                              disabled={isOccupied}
                              onClick={() =>
                                setSelectedBed({
                                  id: bed.id,
                                  code: bed.bed_code,
                                  roomNumber: room.room_number,
                                  rent: bed.monthly_rent || room.base_rent,
                                })
                              }
                              className={`p-3.5 rounded-2xl text-left border transition-all relative ${
                                isOccupied
                                  ? "bg-slate-900/50 border-white/5 text-slate-600 cursor-not-allowed opacity-60"
                                  : isSelected
                                  ? "bg-emerald-500/20 border-emerald-400 text-white ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/25"
                                  : "bg-white/5 border-white/10 hover:border-emerald-500/40 text-slate-200 hover:bg-emerald-500/5"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{bed.bed_code}</span>
                                {!isOccupied && (
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      isSelected ? "bg-emerald-300 animate-pulse" : "bg-emerald-500"
                                    }`}
                                  />
                                )}
                              </div>
                              <div className="text-[11px] mt-1 font-semibold">
                                {isOccupied ? (
                                  <span className="text-slate-500">Occupied</span>
                                ) : isSelected ? (
                                  <span className="text-emerald-300 font-bold">Selected</span>
                                ) : (
                                  <span className="text-emerald-400">Available</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">
                                ₹{(bed.monthly_rent || room.base_rent).toLocaleString()}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl glass-panel text-center text-xs text-slate-400">
                  No rooms or beds listed for this property yet.
                </div>
              )}
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Amenities & Facilities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: BedDouble, title: "Furnished Rooms", sub: "Spring mattress & wardrobe" },
                  { icon: Wifi, title: "Gigabit WiFi", sub: "Fast & reliable fiber" },
                  { icon: Utensils, title: "3-Time Food", sub: "Breakfast, Lunch, Dinner" },
                  { icon: Shield, title: "24x7 Security", sub: "CCTV + Verified Guards" },
                  { icon: Wind, title: "AC & Geysers", sub: "All-weather comfort" },
                  { icon: Zap, title: "Power Backup", sub: "Generator & Inverter" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="p-4 rounded-2xl glass-card flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resident Reviews */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Resident Reviews</h2>
              <div className="space-y-3">
                {[
                  {
                    name: "Karan Patel",
                    rating: 5,
                    date: "Aug 2026",
                    review: "Cleanest PG in this locality! High speed WiFi was critical for my WFH setup and it never dropped. Food is prepared fresh daily.",
                  },
                  {
                    name: "Sanya Roy",
                    rating: 5,
                    date: "Jul 2026",
                    review: "The discrete bed reservation gave me peace of mind before moving to Bangalore. Everything matched the photos exactly.",
                  },
                ].map((rev, i) => (
                  <div key={i} className="p-5 rounded-2xl glass-card space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{rev.name}</span>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-amber-400 text-xs">
                      {"★".repeat(rev.rating)}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Floating Sticky Booking Card */}
          <div className="space-y-6">
            <div className="sticky top-24 p-6 sm:p-8 rounded-3xl glass-panel border border-white/15 space-y-6 shadow-2xl">
              <div>
                <span className="text-xs text-slate-400 font-medium">Monthly Living Rent</span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  ₹{(selectedBed ? selectedBed.rent : property.starting_rent)?.toLocaleString()}{" "}
                  <span className="text-xs text-slate-400 font-normal">/ month</span>
                </div>
              </div>

              {/* Selected Bed Highlight */}
              {selectedBed ? (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Bed {selectedBed.code} Selected</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Room {selectedBed.roomNumber} · Monthly Rent: ₹{selectedBed.rent.toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs text-slate-400">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Choose an available bed in the rooms list to proceed.</span>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Monthly Bed Rent</span>
                  <span className="text-white font-medium">
                    ₹{(selectedBed ? selectedBed.rent : property.starting_rent || 8000).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Maintenance & WiFi</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Security Deposit (Refundable)</span>
                  <span className="text-white font-medium">
                    ₹{((selectedBed ? selectedBed.rent : property.starting_rent || 8000) * 2).toLocaleString()}
                  </span>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-center space-y-2">
                  <div className="text-sm font-bold text-emerald-400">Visit Scheduled!</div>
                  <div className="text-xs text-slate-300">
                    The property manager will reach out to you within 2 business hours.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/dashboard/room"
                    className="w-full py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 text-center block"
                  >
                    Reserve Selected Bed
                  </Link>

                  <button
                    onClick={() => setBookingSuccess(true)}
                    className="w-full py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-colors"
                  >
                    Schedule Free Visit
                  </button>
                </div>
              )}

              {/* Owner Direct Contact */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-emerald-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-slate-400 font-medium">Contact Property Owner</span>
                  <a
                    href={`tel:${property.contact_phone || "+919876543210"}`}
                    className="text-xs font-bold text-white hover:text-emerald-400 transition-colors"
                  >
                    {property.contact_phone || "+91 98765 43210"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
