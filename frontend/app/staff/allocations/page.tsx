"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Room, Bed } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import { BedGrid } from "@/components/bed";
import { formatCurrency } from "@/lib/utils";
import {
  CalendarCheck,
  CheckCircle2,
  Bed as BedIcon,
  Wrench,
  Search,
  Layers,
  Sparkles,
} from "lucide-react";

export default function StaffAllocationsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRooms();
  }, [user]);

  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const data = await api.rooms.getRooms();
      setRooms(data || []);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = rooms.filter((r) =>
    r.room_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <Header
        title="Bed Turnover & Room Inspection Ledger"
        subtitle="Field staff inspection of bed readiness, sanitation checks, and defect tagging."
      />

      {/* Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{filtered.length} Rooms Tracked</span>
      </div>

      {/* Room Bed Grids */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border border-white/5">
          <BedIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Rooms Found</h4>
          <p className="text-xs text-slate-400 mt-1">Check back later or adjust room search.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((room) => (
            <div
              key={room.id}
              className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-white">
                    {room.room_number}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Room {room.room_number}</h4>
                    <p className="text-xs text-slate-400">{room.room_type} — Capacity {room.capacity}</p>
                  </div>
                </div>

                <span className="text-xs text-slate-400">
                  Occupancy: <strong className="text-white">{room.occupied_count || 0}/{room.capacity}</strong>
                </span>
              </div>

              <BedGrid
                beds={room.beds || []}
                roomNumber={room.room_number}
                allowActions={true}
                onRefresh={loadRooms}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
