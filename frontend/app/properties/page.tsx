"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Building,
  Heart,
  Star,
  ShieldCheck,
  Sparkles,
  Wifi,
  Utensils,
  Wind,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { Property } from "@/types";

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("property_type") || "All";
  const initialLocality = searchParams.get("locality") || "All";
  const initialSearch = searchParams.get("search") || "";

  const [activeFilter, setActiveFilter] = useState(
    initialType === "PG" ? "PGs" : initialType === "HOSTEL" ? "Hostels" : "All"
  );
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLocality, setSelectedLocality] = useState(initialLocality);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedBudget, setSelectedBudget] = useState("All");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Sync with URL params if they change
  useEffect(() => {
    const typeParam = searchParams.get("property_type") || "All";
    const localityParam = searchParams.get("locality") || "All";
    const searchParam = searchParams.get("search") || "";

    setSelectedType(typeParam);
    setSelectedLocality(localityParam);
    setSearchQuery(searchParam);
    if (typeParam === "PG") setActiveFilter("PGs");
    else if (typeParam === "HOSTEL") setActiveFilter("Hostels");
    else setActiveFilter("All");
  }, [searchParams]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("staynest_wishlist");
      if (saved) {
        const arr: string[] = JSON.parse(saved);
        const map: Record<string, boolean> = {};
        arr.forEach((id) => { map[id] = true; });
        setFavorites(map);
      }
    } catch {
      // ignore
    }
  }, []);

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["properties", selectedLocality, selectedType, selectedBudget, searchQuery],
    queryFn: () => {
      let minBudget: number | undefined;
      let maxBudget: number | undefined;
      if (selectedBudget === "under-7000") maxBudget = 7000;
      else if (selectedBudget === "7000-8500") { minBudget = 7000; maxBudget = 8500; }
      else if (selectedBudget === "above-8500") minBudget = 8501;

      return api.properties.getAll({
        locality: selectedLocality !== "All" ? selectedLocality : undefined,
        property_type: selectedType !== "All" ? selectedType : undefined,
        min_budget: minBudget,
        max_budget: maxBudget,
        search: searchQuery || undefined,
      });
    },
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        const activeIds = Object.keys(next).filter((k) => next[k]);
        localStorage.setItem("staynest_wishlist", JSON.stringify(activeIds));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const filterPills = [
    "All",
    "PGs",
    "Hostels",
    "With Food",
    "AC Rooms"
  ];

  const handlePillClick = (pill: string) => {
    setActiveFilter(pill);
    if (pill === "All") {
      setSelectedType("All");
      setSelectedLocality("All");
    } else if (pill === "PGs") {
      setSelectedType("PG");
    } else if (pill === "Hostels") {
      setSelectedType("HOSTEL");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8">
        {/* Header Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3" />
              <span>Verified Stays in Bengaluru</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Explore PGs & Hostels
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Find verified premium stays with discrete bed allocation, verified roommates, and chef-cooked meals.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{properties?.length || 0}</span> available properties
          </div>
        </div>

        {/* Search & Filter Header (Desktop) / Sticky Filter (Mobile) */}
        <div className="sticky top-20 z-30 p-3 sm:p-4 rounded-2xl sm:rounded-full glass-panel border border-white/15 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center shadow-2xl">
          {/* Locality */}
          <div className="flex items-center gap-2.5 px-4 py-1.5 border-b sm:border-b-0 sm:border-r border-white/10">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left w-full">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Locality</label>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0F172A] text-white">All Bengaluru</option>
                <option value="Koramangala" className="bg-[#0F172A] text-white">Koramangala</option>
                <option value="HSR Layout" className="bg-[#0F172A] text-white">HSR Layout</option>
                <option value="Indiranagar" className="bg-[#0F172A] text-white">Indiranagar</option>
                <option value="Electronic City" className="bg-[#0F172A] text-white">Electronic City</option>
                <option value="BTM Layout" className="bg-[#0F172A] text-white">BTM Layout</option>
                <option value="Whitefield" className="bg-[#0F172A] text-white">Whitefield</option>
                <option value="Marathahalli" className="bg-[#0F172A] text-white">Marathahalli</option>
              </select>
            </div>
          </div>

          {/* Stay Type */}
          <div className="flex items-center gap-2.5 px-4 py-1.5 border-b sm:border-b-0 sm:border-r border-white/10">
            <Building className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left w-full">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Property Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0F172A] text-white">All (PG & Hostel)</option>
                <option value="PG" className="bg-[#0F172A] text-white">PG Stays</option>
                <option value="HOSTEL" className="bg-[#0F172A] text-white">Hostels</option>
              </select>
            </div>
          </div>

          {/* Monthly Budget */}
          <div className="flex items-center gap-2.5 px-4 py-1.5 border-b sm:border-b-0 border-white/10">
            <span className="text-emerald-400 font-bold text-xs">₹</span>
            <div className="flex flex-col text-left w-full">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Monthly Budget</label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-[#0F172A] text-white">Any Budget</option>
                <option value="under-7000" className="bg-[#0F172A] text-white">Under ₹7,000</option>
                <option value="7000-8500" className="bg-[#0F172A] text-white">₹7,000 - ₹8,500</option>
                <option value="above-8500" className="bg-[#0F172A] text-white">₹8,500+</option>
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => handlePillClick(pill)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeFilter === pill
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105"
                    : "glass-pill text-slate-300 hover:text-white"
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedLocality("All");
              setSelectedType("All");
              setSelectedBudget("All");
              setSearchQuery("");
              setActiveFilter("All");
            }}
            className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
          >
            Reset All Filters
          </button>
        </div>

        {/* 3-Column Property Grid (Desktop) / 1-Column Layout (Mobile) */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-3xl glass-card animate-pulse border border-white/5" />
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => {
              const isFav = !!favorites[p.id];
              return (
                <Link
                  key={p.id}
                  href={`/properties/${p.id}`}
                  className="rounded-3xl glass-card overflow-hidden flex flex-col group relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-white/20"
                >
                  {/* Property Cover Image & Badges */}
                  <div className="relative h-64 w-full overflow-hidden bg-slate-900">
                    <img
                      src={p.cover_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Stay Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#090D14]/85 backdrop-blur-md text-emerald-300 border border-white/10">
                      {p.property_type === "PG" ? "Verified PG" : "Hostel"}
                    </div>

                    {/* Availability Tag */}
                    <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-slate-950 shadow-md">
                      Beds Available Now
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => toggleFavorite(p.id, e)}
                      aria-label="Toggle Favorite"
                      className={`w-9 h-9 rounded-full absolute top-4 right-4 flex items-center justify-center backdrop-blur-md transition-all ${
                        isFav
                          ? "bg-rose-500 text-white"
                          : "bg-[#090D14]/70 text-slate-300 hover:text-white border border-white/10 hover:scale-110"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                          {p.name}
                        </h3>
                        {p.is_verified && (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold shrink-0 ml-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{p.locality}, {p.city}</span>
                      </p>
                    </div>

                    {/* Price and Rating row */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div>
                        <span className="text-2xl font-extrabold text-white">
                          ₹{p.starting_rent?.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400"> / month</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-white font-bold">{p.rating}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({p.total_reviews})</span>
                      </div>
                    </div>

                    {/* Amenities Chips */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-300 pt-1">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                        <Wind className="w-3 h-3 text-slate-400" /> AC
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                        <Wifi className="w-3 h-3 text-slate-400" /> WiFi
                      </span>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                        <Utensils className="w-3 h-3 text-slate-400" /> Food
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="w-full py-2.5 rounded-xl bg-white/5 group-hover:bg-emerald-500 group-hover:text-slate-950 border border-white/10 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-md">
                      <span>View Bed Availability</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-16 rounded-3xl glass-panel text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No stays found</h3>
            <p className="text-xs text-slate-400">
              We couldn&apos;t find properties matching your exact filters. Try broadening your locality or budget.
            </p>
            <button
              onClick={() => {
                setSelectedLocality("All");
                setSelectedType("All");
                setSelectedBudget("All");
                setSearchQuery("");
                setActiveFilter("All");
              }}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090D14] flex items-center justify-center text-slate-400 text-sm">
          Loading properties...
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
