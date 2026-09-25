"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, Property } from "@/lib/api";
import { Room } from "@/types";
import Header from "@/components/dashboard/Header";
import { BedGrid } from "@/components/bed";
import { formatCurrency } from "@/lib/utils";
import {
  Bed,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  Shield,
  Building2,
} from "lucide-react";

export default function WardenRoomsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomSearch, setRoomSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VACANT" | "FULL">("ALL");

  useEffect(() => {
    loadProperties();
  }, [user]);

  useEffect(() => {
    if (selectedPropertyId) {
      loadRooms(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const loadProperties = async () => {
    try {
      const data = await api.getProperties();
      setProperties(data || []);
      if (data && data.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  };

  const loadRooms = async (propId: string) => {
    try {
      setIsLoading(true);
      const data = await api.rooms.getRooms(propId);
      setRooms(data || []);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch = r.room_number.toLowerCase().includes(roomSearch.toLowerCase());
    if (statusFilter === "VACANT") return matchesSearch && (r.available_count || 0) > 0;
    if (statusFilter === "FULL") return matchesSearch && (r.available_count || 0) === 0;
    return matchesSearch;
  });

  const totalBeds = rooms.reduce((acc, r) => acc + (r.beds?.length || r.capacity || 0), 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupied_count || 0), 0);
  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Header
          title="Hostel Bed Status & Floor Map"
          subtitle="Direct operational visibility into room capacity, maintenance downtime, and vacant beds."
        />

        <div className="relative">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="px-4 py-2.5 rounded-full glass-input text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {properties.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0B101B] text-white">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Capacity</div>
            <div className="text-2xl font-black text-white mt-1">{totalBeds} Beds</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Inmates Housed</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{occupiedBeds} Beds</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Available for Check-in</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{vacantBeds} Beds</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Bed className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room number..."
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["ALL", "VACANT", "FULL"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === s
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {s === "ALL" ? "All Rooms" : s === "VACANT" ? "Has Vacancy" : "Full"}
            </button>
          ))}
        </div>
      </div>

      {/* Room Cards with BedGrid */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border border-white/5">
          <Bed className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No Rooms Found</h4>
          <p className="text-xs text-slate-400 mt-1">No rooms match your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-extrabold text-sm">
                    {room.room_number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">Room {room.room_number}</h4>
                      <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-[10px] font-semibold text-slate-300 uppercase">
                        {room.room_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Base Rent: <span className="text-emerald-400 font-bold">{formatCurrency(room.base_rent)}</span>/month
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">
                    Occupancy: <span className="font-bold text-white">{room.occupied_count || 0}/{room.capacity}</span>
                  </span>
                  {(room.available_count || 0) > 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                      {room.available_count} Vacant
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-400 border border-white/10 font-bold text-[10px]">
                      Full
                    </span>
                  )}
                </div>
              </div>

              <BedGrid
                beds={room.beds || []}
                roomNumber={room.room_number}
                allowActions={true}
                onRefresh={() => {
                  if (selectedPropertyId) loadRooms(selectedPropertyId);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
