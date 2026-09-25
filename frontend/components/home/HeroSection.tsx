"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Building } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroSection() {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState("PG");
  const [location, setLocation] = useState("Koramangala");
  const [moveInDate, setMoveInDate] = useState("2026-09-15");

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 100]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (propertyType && propertyType !== "ALL") {
      params.set("property_type", propertyType);
    }
    if (location && location !== "ALL") {
      params.set("locality", location);
    }
    router.push(
      `/properties${params.toString() ? `?${params.toString()}` : ""}`
    );
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-2 pb-6 max-w-7xl mx-auto w-full">
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 min-h-[340px] sm:min-h-[380px] lg:min-h-[420px] flex flex-col justify-end p-5 sm:p-8 lg:p-12 shadow-2xl">
        {/* Cinematic Background — parallax */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')`,
            y: bgY,
            scale: 1.1,
          }}
        />
        <div className="absolute inset-0 hero-gradient" />

        {/* Hero Content — minimal */}
        <div className="relative z-10 max-w-xl space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-[2.75rem] font-bold tracking-tight text-white leading-[1.12]">
            Find Your Perfect Stay{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              in Bengaluru
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300/80 max-w-md">
            Verified PGs and hostels with transparent pricing and real availability.
          </p>
        </div>

        {/* Glass Search Bar */}
        <form
          onSubmit={handleSearch}
          className="relative z-20 mt-5 w-full max-w-3xl p-2 sm:p-2.5 rounded-xl sm:rounded-full glass-panel border border-white/12 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-1.5 sm:gap-0 items-center shadow-xl"
        >
          {/* Stay Type */}
          <div className="flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/8">
            <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left w-full">
              <label className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">
                Stay Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="bg-transparent text-[11px] text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="PG" className="bg-[#0F172A]">PG / Co-Living</option>
                <option value="HOSTEL" className="bg-[#0F172A]">Hostel</option>
                <option value="ALL" className="bg-[#0F172A]">All Stays</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/8">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left w-full">
              <label className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">
                Locality
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-[11px] text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0F172A]">All Localities</option>
                <option value="Koramangala" className="bg-[#0F172A]">Koramangala</option>
                <option value="HSR Layout" className="bg-[#0F172A]">HSR Layout</option>
                <option value="Indiranagar" className="bg-[#0F172A]">Indiranagar</option>
                <option value="Electronic City" className="bg-[#0F172A]">Electronic City</option>
                <option value="BTM Layout" className="bg-[#0F172A]">BTM Layout</option>
                <option value="Whitefield" className="bg-[#0F172A]">Whitefield</option>
                <option value="Marathahalli" className="bg-[#0F172A]">Marathahalli</option>
              </select>
            </div>
          </div>

          {/* Move-in Date */}
          <div className="flex items-center gap-2 px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left w-full">
              <label className="text-[9px] text-slate-500 uppercase font-semibold tracking-wider">
                Move-in Date
              </label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="bg-transparent text-[11px] text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full sm:w-auto h-9 px-5 rounded-lg sm:rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>
    </section>
  );
}
